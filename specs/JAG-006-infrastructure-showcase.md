# JAG-006 — Infrastructure Showcase (AWS & IaC)

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| **ID**      | JAG-006                                |
| **Status**  | ✅ Done                                |
| **Type**    | Feature / Infrastructure / IaC         |
| **Author**  | Javier Álvarez (+ AI pair programming) |
| **Created** | 2026-04-18                             |
| **Depends** | JAG-005                                |

---

## 1. Context & Motivation

While the live portfolio runs on **Vercel + Neon** for cost-efficiency and zero-ops maintenance,
a senior engineer is expected to reason about cloud infrastructure at an enterprise level. This
ticket demonstrates AWS fluency and Infrastructure-as-Code discipline without incurring real AWS
costs by:

1. Writing professional Terraform manifests that define a production-grade, serverless Next.js
   deployment on AWS — ready to `terraform apply` against a real AWS account.
2. Revamping the "Under the Hood" page into a genuine technical deep-dive: architecture diagram,
   IaC code excerpt, CI/CD pipeline breakdown, and a link to the public repo for recruiters.

---

## 2. Technical Decisions

### IaC Tool: Terraform (not CDK / SAM / Pulumi)

| Option        | Reason accepted / rejected                                                 |
| ------------- | -------------------------------------------------------------------------- |
| **Terraform** | ✅ Industry default, cloud-agnostic HCL, widest recruiter/team recognition |
| AWS CDK       | ❌ TypeScript-native but AWS-only; adds a dependency build step            |
| AWS SAM       | ❌ Lambda-specific; too narrow to show broad AWS knowledge                 |
| Pulumi        | ❌ Less prevalent in enterprise job specs despite TypeScript parity        |

### AWS Architecture: Serverless Next.js on AWS

```
User
 │
 ▼
Amazon CloudFront (CDN, TLS termination, cache rules)
 │                │
 ▼                ▼
Amazon S3        AWS Lambda (Node.js 20.x)
(static export,  (server-side rendering,
 _next/static,    API routes, ISR)
 public/)
                  │
                  ▼
            Neon PostgreSQL (external managed DB)
```

**Why this shape?**

- **CloudFront** provides global edge caching, HTTPS with ACM certs, and WAF integration.
- **S3** serves the immutable static bundle cheaply — no egress cost within the same AWS region.
- **Lambda** handles pages that need SSR/ISR (like the Interactive Lab) and Next.js API routes.
  A Function URL or API Gateway v2 HTTP API acts as the origin for the dynamic path.
- **Neon** stays as the managed PostgreSQL; swapping for Amazon RDS Aurora Serverless v2 is a
  one-variable change in Terraform.

### File layout

```
/infrastructure/terraform/
├── main.tf        # Provider, S3, CloudFront, Lambda resources
├── variables.tf   # Input variables (environment, domain, region …)
└── outputs.tf     # CloudFront distribution domain name, Lambda ARN
```

No state backend is configured (this is a demo). In production, `backend "s3"` with DynamoDB
state locking would be the standard choice.

---

## 3. Acceptance Criteria

- [x] `/infrastructure/terraform/` directory exists with `main.tf`, `variables.tf`, `outputs.tf`.
- [x] Terraform files are syntactically valid HCL with professional comments.
- [x] "Under the Hood" page has an architecture section with a visual flow diagram.
- [x] Page displays a Terraform code snippet with an explanatory callout.
- [x] Page has a CI/CD section linking to the GitHub repository.
- [x] `npm run lint`, `npm run type-check`, and `npm run build` all pass.
- [x] Playwright E2E tests (30/30) still pass.

---

## 4. AI Contribution Notes

| Task                            | AI involvement                                                  |
| ------------------------------- | --------------------------------------------------------------- |
| Terraform HCL authorship        | AI drafted the resource blocks; human reviewed AWS API accuracy |
| Architecture diagram (pure CSS) | AI implemented; human validated visual hierarchy                |
| Under the Hood page copy        | Collaborative — human provided all factual claims               |
| Spec writing                    | Human-led; AI assisted with table formatting                    |
