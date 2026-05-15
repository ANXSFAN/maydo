"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

// 客户反馈 2026-05：统一流程入口
//   A) 单点 + 餐厅自取 → /pedido (现有点单 UI)
//   B) 看自助餐菜单 → /pedido?flow=buffet (3 步选择: 下午/晚上 → 成人/儿童 → PDF)
const ENTRIES = [
  {
    key: "single" as const,
    image: "/images/menu1.jpeg",
    href: "/pedido",
  },
  {
    key: "buffet" as const,
    image: "/images/menu2.jpeg",
    href: "/pedido?flow=buffet",
  },
];

export default function MenuSection() {
  const t = useTranslations("Menu");

  return (
    <section
      id="menu"
      className="py-[clamp(80px,10vw,120px)] px-10 bg-night-soft border-y border-night-border"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
            {t("sub")}
          </p>
          <h2 className="text-[clamp(32px,5vw,52px)] font-light text-night-text leading-tight my-3">
            {t("title")}
          </h2>
          <DiamondDivider />
          <p className="font-body text-[15px] text-night-text-dim leading-relaxed font-light max-w-[540px] mx-auto mb-[60px]">
            {t("desc")}
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 gap-7 max-md:grid-cols-1 max-w-[960px] mx-auto">
          {ENTRIES.map((entry, i) => (
            <FadeIn key={entry.key} delay={i * 0.15}>
              <Link
                href={entry.href}
                className="group block bg-night-card border border-night-border transition-all duration-500 relative overflow-hidden hover:-translate-y-2 hover:border-camel hover:shadow-[0_20px_60px_rgba(201,168,124,0.18)] no-underline"
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-camel scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-[2]" />

                <div className="h-[260px] overflow-hidden relative">
                  <Image
                    src={entry.image}
                    alt={t(`${entry.key}Title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/20 to-transparent" />
                </div>

                <div className="py-9 px-7 text-center">
                  <div className="font-body text-[11px] text-camel tracking-[3px] uppercase mb-3">
                    {t(`${entry.key}Tag`)}
                  </div>
                  <h3 className="text-[28px] font-normal text-night-text mb-3">
                    {t(`${entry.key}Title`)}
                  </h3>
                  <p className="font-body text-sm text-night-text-dim leading-relaxed font-light mb-7 max-w-[340px] mx-auto">
                    {t(`${entry.key}Desc`)}
                  </p>
                  <div className="inline-flex items-center gap-2 font-body text-[12px] tracking-[2px] uppercase text-camel border-b border-camel/40 pb-1 group-hover:border-camel transition-colors">
                    {t(`${entry.key}Cta`)}
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
