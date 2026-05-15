"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import DiamondDivider from "@/components/ui/DiamondDivider";
import HeroCarousel from "@/components/home/HeroCarousel";

// GAMMA 新拍 8 张精选 (2026-05)
// 注：原图 ~50MB，部署前建议压缩为 webp/avif (目标单张 ≤ 400KB)
// Next/Image 运行时会自动生成响应式尺寸，但源文件预压缩能加速 build
const HERO_IMAGES = [
  "/images/hero/hero-1-ambiente.jpg",      // 餐厅环境
  "/images/hero/hero-2-chef-fuego.jpg",    // 厨师炒锅大火
  "/images/hero/hero-3-sushi-sake.jpg",    // 寿司 + 清酒
  "/images/hero/hero-4-mesa-sushi.jpg",    // 多盘寿司
  "/images/hero/hero-5-llamas.jpg",        // 火焰特写
  "/images/hero/hero-6-vino-plato.jpg",    // 红酒配菜
  "/images/hero/hero-7-cocina.jpg",        // 后厨
  "/images/hero/hero-8-papillote.jpg",     // 锡纸特色菜
];

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="h-screen min-h-[700px] flex flex-col items-center justify-center text-center relative overflow-hidden">
      <HeroCarousel images={HERO_IMAGES} alt="Sushi Maydo" />

      {/* Gradient overlays — 黑底版本：加深背景对比 */}
      <div className="absolute inset-0 bg-black/55 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-night/40 via-transparent to-night/40 z-[1]" />

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
