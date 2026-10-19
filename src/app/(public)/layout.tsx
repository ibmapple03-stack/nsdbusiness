import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { isPreview } from "@/server/public-data";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {isPreview() && (
        <div role="note" className="bg-gold-100 text-[#4d3700]">
          <p className="container-page py-2 text-sm">
            <strong className="font-semibold">Development preview.</strong> This site is showing draft text awaiting approval and fictional demonstration data. It is not the
            published website.
          </p>
        </div>
      )}
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
