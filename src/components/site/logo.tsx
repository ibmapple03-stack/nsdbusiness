import Image from "next/image";
import mark from "../../../public/brand/nsd-mark.png";

/**
 * NSD mark, extracted from the supplied artwork (brand assets/logo.jpg) with
 * its baked-in checkerboard removed. Replace public/brand/* with exports from
 * the original vector file when management supplies it.
 *
 * The navy mark has low contrast on the deep-navy surfaces, so on dark
 * backgrounds (`inverse`) it sits on a white tile.
 */
export function LogoMark({ className = "h-9", inverse = false }: { className?: string; inverse?: boolean }) {
  const img = <Image src={mark} alt="" aria-hidden priority className={`${className} w-auto`} />;
  if (!inverse) return img;
  return <span className="inline-flex rounded-[var(--radius-sm)] bg-white px-1.5 py-1">{img}</span>;
}

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark inverse={inverse} className={inverse ? "h-8" : "h-11"} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.0625rem] font-bold tracking-[-0.02em] ${inverse ? "text-white" : "text-navy-800"}`}>NSD Business</span>
        <span className={`font-display text-[0.8125rem] font-semibold tracking-[0.01em] ${inverse ? "text-gold-400" : "text-gold-700"}`}>Academy Limited</span>
      </span>
    </span>
  );
}
