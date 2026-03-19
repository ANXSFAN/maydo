"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DiamondDivider from "./DiamondDivider";

export default function ComingSoon({
  titleKey,
  descKey,
}: {
  titleKey: string;
  descKey: string;
}) {
  const t = useTranslations("Pages");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-10 bg-cream">
      <span className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
        {t("comingSoon")}
      </span>
      <h1 className="text-[clamp(36px,6vw,64px)] font-light text-maroon leading-tight mt-3 mb-2">
        {t(titleKey)}
      </h1>
      <DiamondDivider />
      <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[480px] mb-10">
        {t(descKey)}
      </p>
      <Link
        href="/"
        className="inline-block px-10 py-4 bg-maroon text-white font-heading text-sm tracking-[3px] uppercase transition-all hover:bg-maroon-dark hover:-translate-y-0.5"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
