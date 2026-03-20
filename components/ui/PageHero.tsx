"use client";

import { motion } from "framer-motion";
import DiamondDivider from "./DiamondDivider";

type PageHeroProps = {
  sub: string;
  title: string;
  desc: string;
  kanji?: string;
};

export default function PageHero({ sub, title, desc, kanji = "鮮" }: PageHeroProps) {
  return (
    <section className="pt-[clamp(140px,18vw,180px)] pb-[clamp(60px,8vw,100px)] bg-gradient-to-b from-maroon-dark to-maroon relative overflow-hidden text-center">
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
      <div className="absolute top-[10%] right-[8%] text-[200px] font-light text-white/[0.04] font-cjk select-none leading-none">
        {kanji}
      </div>

      <div className="relative z-[2] max-w-[700px] mx-auto px-10">
        <motion.p
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-body text-xs tracking-[5px] uppercase text-camel font-normal mb-4"
        >
          {sub}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[clamp(36px,6vw,60px)] font-light text-white leading-tight mb-3"
        >
          {title}
        </motion.h1>

        <DiamondDivider className="text-camel/50" />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-body text-[15px] text-white/60 font-light tracking-wider leading-relaxed mt-4"
        >
          {desc}
        </motion.p>
      </div>
    </section>
  );
}
