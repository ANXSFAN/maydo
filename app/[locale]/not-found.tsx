import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DiamondDivider from "@/components/ui/DiamondDivider";

export default function NotFound() {
  const t = useTranslations("Pages");

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-maroon-dark to-maroon px-6 py-20">
      <div className="max-w-[520px] mx-auto text-center relative">
        <div className="absolute top-[15%] right-[10%] text-[280px] font-light text-white/[0.04] font-cjk select-none leading-none pointer-events-none">
          無
        </div>

        <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal mb-4 relative z-10">
          404
        </p>

        <h1 className="text-[clamp(32px,5vw,48px)] font-light text-white leading-tight mb-3 relative z-10">
          {t("notFoundTitle")}
        </h1>

        <DiamondDivider className="text-camel/50" />

        <p className="font-body text-[15px] text-white/60 font-light tracking-wider leading-relaxed mt-4 mb-10 relative z-10">
          {t("notFoundDesc")}
        </p>

        <Link
          href="/"
          className="inline-block px-10 py-4 bg-camel text-maroon-dark border-none font-heading text-[13px] tracking-[3px] uppercase no-underline transition-all duration-300 hover:bg-camel/80 hover:-translate-y-0.5 relative z-10"
        >
          {t("backHome")}
        </Link>
      </div>
    </section>
  );
}
