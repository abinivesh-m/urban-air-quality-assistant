"use client";

import { useEffect } from "react";

interface ErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Route-level error boundary. Keeps a single failure from taking down the
 * whole app and offers a retry without a full reload.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface the digest in dev; production logs go through the host platform.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="max-w-md text-sm text-slate-600">
        The assistant hit an unexpected error. Your data and settings are safe —
        try again, or reload the page.
      </p>
      {error.digest ? (
        <p className="text-xs text-slate-500">Reference: {error.digest}</p>
      ) : null}
      <button type="button" onClick={reset} className="btn-primary">
        Try again
      </button>
    </main>
  );
}
