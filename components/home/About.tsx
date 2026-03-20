"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const ABOUT_IMAGE = "/images/about.avif";

export default function About() {
  const t = useTranslations("About");

  const stats = [
    { num: t("stat1"), label: t("stat1Label") },
    { num: t("stat2"), label: t("stat2Label") },
    { num: t("stat3"), label: t("stat3Label") },
  ];

  return (
    <section className="py-[clamp(80px,12vw,160px)] px-10 max-w-[1200px] mx-auto">
      <div className="flex gap-20 items-center max-md:flex-col">
        {/* Text */}
        <FadeIn className="flex-1 min-w-[280px]">
          <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
            {t("sub")}
          </p>
          <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
            {t("title")}
          </h2>
          <DiamondDivider />
          <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[540px]">
            {t("desc")}
          </p>
          <div className="flex gap-12 mt-12 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-light text-maroon">{s.num}</div>
                <div className="font-body text-xs text-gray tracking-[2px] mt-1.5 font-light">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Image */}
        <FadeIn delay={0.2} scale className="flex-1 min-w-[280px]">
          <div className="relative max-w-[420px]">
            <div className="aspect-[4/5] overflow-hidden relative">
              <Image
                src={ABOUT_IMAGE}
                alt="Sushi preparation"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(201,168,124,0.2)",
              }}
            />
            <div className="absolute -top-4 -right-4 w-[120px] h-[120px] border border-camel opacity-25" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-maroon opacity-[0.08]" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
