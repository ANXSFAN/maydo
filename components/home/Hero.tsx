"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import DiamondDivider from "@/components/ui/DiamondDivider";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="h-screen min-h-[700px] flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/hero-bg.avif"
        alt="Sushi Maydo"
        fill
        priority
        className="object-cover"
      />

      {/* Gradient overlays — blend image with brand color */}
      <div className="absolute inset-0 bg-maroon-dark/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 via-transparent to-maroon-dark/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/30 via-transparent to-maroon-dark/30" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative kanji */}
      <div className="absolute top-[12%] right-[8%] text-[220px] font-light text-white/[0.04] font-cjk select-none leading-none">
        真
      </div>
      <div className="absolute bottom-[10%] left-[6%] text-[180px] font-light text-white/[0.04] font-cjk select-none">
        味
      </div>

      {/* Content */}
      <div className="relative z-[2]">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-body text-sm tracking-[6px] text-white uppercase font-normal mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
        >
          {t("sub")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="text-[clamp(64px,12vw,150px)] font-light text-white tracking-[clamp(12px,3vw,30px)] leading-none mb-2 drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        >
          {t("title")}
        </motion.h1>

        <p className="text-[clamp(16px,2.5vw,24px)] text-camel font-light tracking-[6px] mb-8 font-cjk drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          {t("tagline")}
        </p>

        <DiamondDivider className="text-camel/50" />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-body text-[15px] text-white/60 font-light tracking-wider leading-relaxed max-w-[460px] mx-auto mb-12 px-5"
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
            className="inline-block px-12 py-[18px] bg-maroon/80 text-white border border-maroon font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 backdrop-blur-sm hover:bg-maroon hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.4)]"
          >
            {t("cta")}
          </a>
          <a
            href="#menu"
            className="inline-block px-12 py-[18px] bg-white/5 text-white border border-white/30 font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 backdrop-blur-sm hover:bg-white/15 hover:border-white/60"
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
