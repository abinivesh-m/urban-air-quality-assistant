export function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-600">
        <p className="font-medium text-slate-700">
          Urban Air Quality Assistant · Next.js · TypeScript · WCAG 2.2 AA
        </p>
        <p className="mt-1">
          Readings are representative sample data for demonstration, not a live
          feed. Check your national monitoring agency for real-time figures.
        </p>
      </div>
    </footer>
  );
}
