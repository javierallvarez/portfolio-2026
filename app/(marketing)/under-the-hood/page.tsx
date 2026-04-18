import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under the Hood",
  description:
    "A transparent look at the architecture, CI/CD pipeline, Spec-Driven process, and AI-assisted workflow behind this portfolio.",
};

/**
 * Under the Hood — JAG-XXX (to be fully implemented)
 *
 * Planned sections:
 * - Architecture diagram
 * - CI/CD badge strip (linked to GitHub Actions)
 * - PR template example with highlighted AI Contribution section
 * - Spec-Driven workflow explanation (JAG-XXX lifecycle)
 * - Tech stack breakdown with rationale
 * - Security measures (Zod, DOMPurify, rate limiting, CORS)
 */
export default function UnderTheHoodPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Under the Hood</h1>
      <p className="text-default-500 mt-4 text-lg">
        A transparent look at the architecture, tooling, and process behind this portfolio.
      </p>
      <div className="border-default-200 text-default-400 mt-12 rounded-xl border border-dashed p-8 text-center">
        🚧 Full content coming in JAG-XXX
      </div>
    </div>
  );
}
