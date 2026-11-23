import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <p className="text-sm text-slate-600">
        That page doesn&apos;t exist. The air quality dashboard is one click away.
      </p>
      <Link href="/" className="btn-primary">
        Back to dashboard
      </Link>
    </main>
  );
}
