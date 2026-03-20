"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

export default function SobreContent() {
  const t = useTranslations("Sobre");

  return (
    <section className="bg-cream">
      {/* Brand story */}
      <div className="py-[clamp(60px,8vw,100px)] px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-16 items-center max-md:flex-col">
            <FadeIn className="flex-1">
              <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-4">
                {t("storySub")}
              </p>
              <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon leading-tight mb-4">
                {t("storyTitle")}
              </h2>
              <DiamondDivider className="text-camel !justify-start" />
              <p className="font-body text-[15px] text-gray leading-[1.9] font-light mt-6">
                {t("storyP1")}
              </p>
              <p className="font-body text-[15px] text-gray leading-[1.9] font-light mt-4">
                {t("storyP2")}
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="w-[420px] shrink-0 max-md:w-full">
              <div className="relative h-[500px] max-md:h-[350px] overflow-hidden">
                <Image
                  src="/images/about.avif"
                  alt="MAYDO Restaurant"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/20 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Philosophy banner */}
      <div className="py-[clamp(60px,8vw,100px)] px-10 bg-maroon relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-[5%] left-[5%] text-[180px] font-light text-white/[0.04] font-cjk select-none leading-none">
          道
        </div>
        <div className="max-w-[700px] mx-auto text-center relative z-[2]">
          <FadeIn>
            <p className="font-body text-[11px] tracking-[5px] uppercase text-camel mb-4">
              {t("philoSub")}
            </p>
            <h2 className="text-[clamp(26px,4vw,40px)] font-light text-white leading-tight mb-4">
              {t("philoTitle")}
            </h2>
            <DiamondDivider className="text-camel/50" />
            <p className="font-body text-[16px] text-white/60 leading-[2] font-light mt-6 italic">
              {t("philoText")}
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Stats */}
      <div className="py-[clamp(60px,8vw,80px)] px-10 bg-white">
        <div className="max-w-[900px] mx-auto">
          <FadeIn>
            <div className="grid grid-cols-4 gap-8 text-center max-sm:grid-cols-2">
              {[
                { value: t("stat1"), label: t("stat1Label") },
                { value: t("stat2"), label: t("stat2Label") },
                { value: t("stat3"), label: t("stat3Label") },
                { value: t("stat4"), label: t("stat4Label") },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-[clamp(36px,5vw,48px)] font-light text-maroon leading-none">
                    {stat.value}
                  </div>
                  <div className="font-body text-[12px] tracking-[2px] uppercase text-gray mt-3 font-light">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Team section */}
      <div className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
        <div className="max-w-[1200px] mx-auto text-center">
          <FadeIn>
            <p className="font-body text-[11px] tracking-[5px] uppercase text-camel mb-3">
              {t("teamSub")}
            </p>
            <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon mb-4">
              {t("teamTitle")}
            </h2>
            <DiamondDivider />
            <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[600px] mx-auto mb-12">
              {t("teamDesc")}
            </p>
          </FadeIn>

          <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group">
                  <div className="relative h-[360px] overflow-hidden mb-5">
                    <Image
                      src={`/images/gallery-${i + 6}.jpg`}
                      alt={t(`team${i}Name`)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/40 to-transparent" />
                  </div>
                  <h3 className="text-[20px] font-light text-maroon mb-1">
                    {t(`team${i}Name`)}
                  </h3>
                  <p className="font-body text-[12px] tracking-[2px] uppercase text-camel">
                    {t(`team${i}Role`)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
