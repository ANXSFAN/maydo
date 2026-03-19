"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

export default function QuoteBanner() {
  const t = useTranslations("Quote");

  return (
    <section className="h-[500px] relative overflow-hidden bg-gradient-to-br from-maroon-dark to-maroon">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative h-full flex items-center justify-center z-[2]">
        <FadeIn>
          <div className="text-center px-10">
            <p className="text-[clamp(24px,3.5vw,42px)] font-light text-white leading-relaxed max-w-[700px] italic">
              &ldquo;{t("text")}&rdquo;
            </p>
            <DiamondDivider className="text-camel/50" />
            <p className="font-body text-xs text-camel tracking-[4px] mt-2">
              {t("author")}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
