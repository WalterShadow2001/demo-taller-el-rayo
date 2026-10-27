"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error so it shows up in browser console and Vercel logs
    console.error("[Taller HomePage Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground max-w-md break-all">
        {error.message}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Digest: {error.digest}
        </p>
      )}
      <pre className="max-w-2xl overflow-auto rounded-md border p-4 text-left text-xs">
        {error.stack}
      </pre>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
}
