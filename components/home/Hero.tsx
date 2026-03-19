"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import DiamondDivider from "@/components/ui/DiamondDivider";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="h-screen min-h-[700px] flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-maroon-dark via-maroon to-maroon-light">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative kanji */}
      <div className="absolute top-[12%] right-[8%] text-[220px] font-light text-white/[0.035] font-cjk select-none leading-none">
        真
      </div>
      <div className="absolute bottom-[10%] left-[6%] text-[180px] font-light text-white/[0.035] font-cjk select-none">
        味
      </div>

      {/* Content */}
      <div className="relative z-[2]">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-body text-xs tracking-[6px] text-camel uppercase font-light mb-8"
        >
          {t("sub")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="text-[clamp(64px,12vw,150px)] font-light text-white tracking-[clamp(12px,3vw,30px)] leading-none mb-2"
        >
          {t("title")}
        </motion.h1>

        <p className="text-[clamp(16px,2.5vw,24px)] text-white/30 font-light tracking-[6px] mb-8 font-cjk">
          {t("tagline")}
        </p>

        <DiamondDivider className="text-camel/50" />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-body text-[15px] text-white/50 font-light tracking-wider leading-relaxed max-w-[460px] mx-auto mb-12 px-5"
        >
          {t("desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex gap-5 flex-wrap justify-center"
        >
          <a
            href="#reserve"
            className="inline-block px-12 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)]"
          >
            {t("cta")}
          </a>
          <a
            href="#menu"
            className="inline-block px-12 py-[18px] bg-transparent text-white border border-white/40 font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-white/10 hover:border-white"
          >
            {t("cta2")}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-shimmer z-[2]">
        <span className="font-body text-[10px] text-white/30 tracking-[3px]">
          {t("scroll")}
        </span>
        <div className="w-px h-[30px] bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
