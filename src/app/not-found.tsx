import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto h-14" />
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.03em]">Page not found</h1>
        <p className="mt-3 text-muted">The page may have moved, or it may not be published yet.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <ButtonLink href="/courses" variant="secondary">
            Browse courses
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/contact" className="text-navy-700 underline underline-offset-4">
            Contact the academy
          </Link>
        </p>
      </div>
    </main>
  );
}
