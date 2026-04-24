# ─── variables.tf ────────────────────────────────────────────────────────────
#
# Input variables allow this module to be reused across environments (staging,
# production) without touching the resource definitions in main.tf.
# All defaults point at a safe, cost-minimal configuration.
# ─────────────────────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region where Lambda and S3 resources are deployed. CloudFront is global."
  type        = string
  default     = "eu-west-1" # Ireland — closest AWS region to Spain
}

variable "environment" {
  description = "Deployment environment tag applied to every resource (staging | production)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be 'staging' or 'production'."
  }
}

variable "project_name" {
  description = "Short project identifier used as a prefix for resource names."
  type        = string
  default     = "jag-portfolio"
}

variable "domain_name" {
  description = "Custom domain served by CloudFront (e.g. javieralvarez.dev). Leave empty to use the default CloudFront domain."
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of an ACM certificate in us-east-1 (required by CloudFront) for the custom domain. Ignored when domain_name is empty."
  type        = string
  default     = ""
}

variable "lambda_memory_mb" {
  description = "Memory allocated to the SSR Lambda function in MB. Increasing this also increases proportional CPU. 512 MB is the sweet spot for Next.js cold starts."
  type        = number
  default     = 512
}

variable "lambda_timeout_seconds" {
  description = "Maximum execution time for the SSR Lambda. Next.js pages rarely exceed 10s; 30s guards against slow DB queries."
  type        = number
  default     = 30
}

variable "s3_force_destroy" {
  description = "Allow Terraform to delete the S3 bucket even when it still contains objects. Set to true only in non-production environments."
  type        = bool
  default     = false
}
