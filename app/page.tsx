/**
 * Homepage — JAG-XXX (to be designed and implemented)
 *
 * Planned sections:
 * - Hero: Name, title, brief bio, CTA buttons (View Movies, Under the Hood)
 * - Tech Stack visual
 * - Featured projects / skills
 * - CI/CD badge strip
 */
export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        JAG — Software Engineer
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-default-500">
        Spec-driven, AI-assisted, enterprise-quality. Built in public.
      </p>
    </div>
  );
}
