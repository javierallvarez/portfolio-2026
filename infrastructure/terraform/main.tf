# ─── main.tf ─────────────────────────────────────────────────────────────────
#
# Serverless Next.js on AWS — Infrastructure as Code
#
# Architecture:
#   User → CloudFront → S3  (static assets: _next/static, public/)
#                    ↘ Lambda  (SSR pages, API routes, ISR)
#                         ↓
#                   Neon PostgreSQL  (external managed DB — no VPC needed)
#
# Cost model (idle): ~$0/month on AWS Free Tier for low-traffic portfolios.
# Lambda charges per invocation + duration; S3 charges per GB stored.
# CloudFront has a generous free tier (1 TB egress/month for 12 months).
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production state backend — uncomment and configure before running `terraform apply`.
  # Stores state in S3 and uses DynamoDB for state-lock to prevent concurrent applies.
  #
  # backend "s3" {
  #   bucket         = "jag-portfolio-terraform-state"
  #   key            = "portfolio/terraform.tfstate"
  #   region         = "eu-west-1"
  #   dynamodb_table = "jag-portfolio-terraform-locks"
  #   encrypt        = true
  # }
}

# ─── Provider ────────────────────────────────────────────────────────────────

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ACM certificates must live in us-east-1 for CloudFront to use them.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ─── S3 Bucket — Static Assets ───────────────────────────────────────────────
#
# Stores the Next.js static export:  _next/static/**  and  public/**
# The bucket is kept PRIVATE; CloudFront accesses it via an Origin Access Control
# (OAC) policy — never via a public bucket URL. This prevents direct-origin bypass.

resource "aws_s3_bucket" "static_assets" {
  bucket        = "${var.project_name}-static-${var.environment}"
  force_destroy = var.s3_force_destroy
}

# Explicitly block all public access — objects are served exclusively through CloudFront.
resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-side encryption at rest using AWS-managed keys (SSE-S3).
# For stricter compliance requirements, swap to aws:kms with a customer-managed key.
resource "aws_s3_bucket_server_side_encryption_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ─── CloudFront Origin Access Control ────────────────────────────────────────
#
# OAC (the successor to OAI) lets CloudFront sign requests to S3 using
# Signature Version 4, without exposing S3 bucket URLs to end users.

resource "aws_cloudfront_origin_access_control" "static_assets" {
  name                              = "${var.project_name}-oac-${var.environment}"
  description                       = "OAC for ${var.project_name} static assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ─── Lambda — SSR / API Routes ───────────────────────────────────────────────
#
# This function handles every Next.js request that cannot be served from the
# static cache: server-side rendered pages, API routes (/api/**), and ISR
# revalidation webhooks.
#
# The deployment package is a zip produced by `next build` + a custom handler
# shim (e.g. the open-source `@serwist/next` or a custom adapter).
# For this demo the zip path is a local placeholder; in CI the build artifact
# would be uploaded via `aws s3 cp` and the Lambda updated with `aws lambda
# update-function-code`.

data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/.lambda_placeholder.zip"

  # Minimal Node.js handler — replaced by the real Next.js bundle in CI/CD.
  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'ok' });"
    filename = "index.js"
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-${var.environment}"

  # Trust policy: only the Lambda service may assume this role.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Attach the AWS-managed policy for basic Lambda execution (CloudWatch Logs).
resource "aws_iam_role_policy_attachment" "lambda_basic_exec" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "ssr" {
  function_name = "${var.project_name}-ssr-${var.environment}"
  description   = "Next.js SSR handler — processes pages and /api routes that require server-side execution."
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs20.x" # Matches the Node.js version used in CI (see ci.yml)
  handler       = "index.handler"
  filename      = data.archive_file.lambda_placeholder.output_path
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  # Snap Start is not available for Node.js runtimes (only Java 11+).
  # To reduce cold starts: pre-warm with EventBridge scheduled rule or
  # provision a small reserved concurrency during business hours.

  environment {
    variables = {
      NODE_ENV    = var.environment == "production" ? "production" : "development"
      # Secrets (DATABASE_URL, CLERK_SECRET_KEY, etc.) are injected at deploy
      # time from AWS Secrets Manager via a separate CI step — never stored here.
    }
  }
}

# Lambda Function URL — the simplest way to expose a Lambda as an HTTP endpoint
# without the overhead of API Gateway. Supports streaming responses (required for
# Next.js App Router streaming SSR).
resource "aws_lambda_function_url" "ssr" {
  function_name      = aws_lambda_function.ssr.function_name
  authorization_type = "NONE" # Public URL — CloudFront handles auth/rate limiting

  cors {
    allow_credentials = false
    allow_origins     = ["https://${var.domain_name != "" ? var.domain_name : "*"}"]
    allow_methods     = ["GET", "HEAD", "POST"]
    max_age           = 300
  }
}

# ─── CloudFront Distribution ──────────────────────────────────────────────────
#
# Single distribution with two origins:
#   1. S3  — serves static files (_next/static/**, public/**)
#   2. Lambda Function URL — serves everything else (SSR, API routes)
#
# Cache behaviours are ordered: static paths hit S3 first (long TTL), dynamic
# paths fall through to Lambda (no cache or short TTL).

locals {
  s3_origin_id     = "s3-static-origin"
  lambda_origin_id = "lambda-ssr-origin"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} CDN (${var.environment})"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Europe + North America edge nodes only (cheapest)

  aliases = var.domain_name != "" ? [var.domain_name] : []

  # ── Origin 1: S3 static assets ──────────────────────────────────────────────
  origin {
    domain_name              = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.static_assets.id
  }

  # ── Origin 2: Lambda Function URL (SSR) ─────────────────────────────────────
  origin {
    # Strip the https:// prefix from the Function URL for CloudFront.
    domain_name = replace(aws_lambda_function_url.ssr.function_url, "https://", "")
    origin_id   = local.lambda_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ── Cache behaviour: Next.js static chunks (immutable, 1 year TTL) ──────────
  # _next/static/** contains content-hashed filenames so they are safe to cache
  # indefinitely. This is where the bulk of bandwidth savings come from.
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 31536000 # 1 year
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  # ── Cache behaviour: public/ static files (images, fonts, favicons) ─────────
  ordered_cache_behavior {
    path_pattern           = "/public/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 86400  # 1 day
    default_ttl = 86400
    max_ttl     = 604800 # 7 days
  }

  # ── Default behaviour: all other paths → Lambda SSR ─────────────────────────
  # Full query-string and cookie forwarding so the Lambda can read auth tokens
  # and render personalised pages (e.g. the admin view in the Interactive Lab).
  default_cache_behavior {
    target_origin_id       = local.lambda_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "CloudFront-Forwarded-Proto"]
      cookies { forward = "all" }
    }

    min_ttl     = 0
    default_ttl = 0   # Do not cache SSR responses by default; Next.js manages its own cache headers
    max_ttl     = 300 # 5 min upper bound as a safety net
  }

  # Enforce HTTPS at the CloudFront level; redirect HTTP → HTTPS.
  viewer_certificate {
    dynamic "acm_certificate" {
      for_each = var.acm_certificate_arn != "" ? [1] : []
      content {
        acm_certificate_arn      = var.acm_certificate_arn
        ssl_support_method       = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
      }
    }

    # Fall back to the default CloudFront certificate when no custom domain is configured.
    cloudfront_default_certificate = var.acm_certificate_arn == ""
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# ─── S3 Bucket Policy — grant CloudFront OAC read access ─────────────────────

data "aws_iam_policy_document" "s3_cloudfront_read" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static_assets.arn}/*"]

    # Scope the policy to this specific CloudFront distribution so other
    # distributions in the same AWS account cannot read from this bucket.
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  policy = data.aws_iam_policy_document.s3_cloudfront_read.json
}
