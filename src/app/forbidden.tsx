import { ButtonLink } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-[-0.03em]">You do not have access to this page</h1>
        <p className="mt-3 text-muted">Your role does not include this area. If you need access, ask the Managing Director to update your permissions.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/admin">Go to your dashboard</ButtonLink>
        </div>
      </div>
    </main>
  );
}
