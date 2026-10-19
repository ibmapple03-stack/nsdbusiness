"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-3xl font-bold tracking-[-0.03em]">{offline ? "You appear to be offline" : "Something went wrong"}</h1>
        <p className="mt-3 text-muted">
          {offline
            ? "Check your internet connection, then try again. Anything you typed into a form has not been sent."
            : "The page could not be loaded. Try again — if it keeps happening, contact the academy office."}
        </p>
        {error.digest && <p className="mt-2 text-sm text-muted">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Go to the home page
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
