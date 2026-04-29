"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const ENTRIES = [
  { key: "lunch" as const, image: "/images/menu1.jpeg" },
  { key: "dinner" as const, image: "/images/menu2.jpeg" },
];

export default function MenuSection() {
  const t = useTranslations("Menu");

  return (
    <section id="menu" className="py-[clamp(80px,10vw,120px)] px-10 bg-white">
      <div className="max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
            {t("sub")}
          </p>
          <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
            {t("title")}
          </h2>
          <DiamondDivider />
          <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[540px] mx-auto mb-[60px]">
            {t("desc")}
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 gap-7 max-md:grid-cols-1 max-w-[960px] mx-auto">
          {ENTRIES.map((entry, i) => (
            <FadeIn key={entry.key} delay={i * 0.15}>
              <Link
                href={`/carta?menu=${entry.key}`}
                className="group block bg-white border border-beige transition-all duration-500 relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(122,66,66,0.12)] no-underline"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-camel scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-[2]" />

                <div className="h-[260px] overflow-hidden relative">
                  <Image
                    src={entry.image}
                    alt={t(`${entry.key}Title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>

                <div className="py-9 px-7 text-center">
                  <div className="font-body text-[11px] text-camel tracking-[3px] uppercase mb-3">
                    {t(`${entry.key}Time`)}
                  </div>
                  <h3 className="text-[28px] font-normal text-maroon mb-3">
                    {t(`${entry.key}Title`)}
                  </h3>
                  <p className="font-body text-sm text-gray leading-relaxed font-light mb-7 max-w-[340px] mx-auto">
                    {t(`${entry.key}Desc`)}
                  </p>
                  <div className="inline-flex items-center gap-2 font-body text-[12px] tracking-[2px] uppercase text-maroon border-b border-camel/40 pb-1 group-hover:border-camel transition-colors">
                    {t("cta")}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
