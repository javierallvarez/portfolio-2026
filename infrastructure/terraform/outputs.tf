# ─── outputs.tf ──────────────────────────────────────────────────────────────
#
# Outputs are surfaced after `terraform apply` and can be consumed by other
# Terraform modules or CI/CD steps (e.g. to update the CNAME record in Route 53
# or to trigger a CloudFront cache invalidation).
# ─────────────────────────────────────────────────────────────────────────────

output "cloudfront_domain" {
  description = "Default CloudFront domain name for the distribution (use as CNAME target when setting up a custom domain in Route 53 or your DNS provider)."
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — required for cache invalidations in CI/CD: `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`"
  value       = aws_cloudfront_distribution.cdn.id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket that stores static assets. Use this in CI to upload the Next.js static output: `aws s3 sync .next/static s3://<bucket>/_next/static --cache-control 'max-age=31536000,immutable'`"
  value       = aws_s3_bucket.static_assets.bucket
}

output "lambda_function_name" {
  description = "Name of the SSR Lambda function. Reference this in CI to update the function code after each deployment: `aws lambda update-function-code --function-name <name> --zip-file fileb://bundle.zip`"
  value       = aws_lambda_function.ssr.function_name
}

output "lambda_function_url" {
  description = "Public HTTPS URL for the Lambda Function URL endpoint (used as the dynamic origin by CloudFront — not intended for direct client access)."
  value       = aws_lambda_function_url.ssr.function_url
  sensitive   = false
}
