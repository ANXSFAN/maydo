"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

type MenuType = "lunch" | "dinner" | "daily";

const MENU_TYPES: MenuType[] = ["lunch", "dinner", "daily"];

const SUSHI_CATEGORIES = [
  "tartar",
  "ensaladas",
  "sunomono",
  "chirashi",
  "hosomaki",
  "temaki",
  "uramaki",
  "futomaki",
  "sushiMixto",
  "sashimi",
  "carpaccio",
  "nigiri",
  "onigiri",
  "gunkan",
];

const COCINA_CATEGORIES = [
  "arroz",
  "sobaFideos",
  "fritura",
  "teppanyaki",
  "sopa",
  "vapor",
  "platosChinos",
];

const GALLERY_IMAGES = [
  "/images/menu1.jpeg",
  "/images/menu2.jpeg",
  "/images/menu3.jpeg",
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
];

export default function CartaContent() {
  const t = useTranslations("Carta");
  const [activeMenu, setActiveMenu] = useState<MenuType>("lunch");

  return (
    <section className="bg-cream">
      {/* Menu type tabs */}
      <div className="py-[clamp(60px,8vw,100px)] px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            {MENU_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveMenu(type)}
                className={`
                  group relative text-left p-8 border transition-all duration-500 cursor-pointer
                  ${
                    activeMenu === type
                      ? "bg-maroon border-maroon text-white shadow-[0_20px_60px_rgba(122,66,66,0.2)]"
                      : "bg-white border-beige text-maroon hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(122,66,66,0.08)]"
                  }
                `}
              >
                <div
                  className={`
                  absolute top-0 left-0 w-full h-[3px] transition-transform duration-500 origin-left
                  ${
                    activeMenu === type
                      ? "bg-camel scale-x-100"
                      : "bg-camel scale-x-0 group-hover:scale-x-100"
                  }
                `}
                />

                <div className="font-body text-[11px] tracking-[3px] text-camel mb-3">
                  {t(`${type}Time`)}
                </div>
                <h3 className="text-[clamp(20px,2.5vw,26px)] font-light mb-2">
                  {t(type)}
                </h3>
                <p
                  className={`font-body text-sm leading-relaxed font-light mb-5 ${
                    activeMenu === type ? "text-white/70" : "text-gray"
                  }`}
                >
                  {t(`${type}Desc`)}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-light">
                    {t(`${type}Price`)}
                  </span>
                  <span
                    className={`font-body text-xs ${
                      activeMenu === type ? "text-white/50" : "text-gray"
                    }`}
                  >
                    {t(`${type}Unit`)}
                  </span>
                </div>
                {t.has(`${type}ChildPrice`) && (
                  <div
                    className={`font-body text-[13px] mt-2 ${
                      activeMenu === type ? "text-white/50" : "text-gray"
                    }`}
                  >
                    {t(`${type}ChildLabel`)}: {t(`${type}ChildPrice`)}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="text-center mt-6">
            <p className="font-body text-[13px] text-gray font-light">
              {t("taxNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Menu detail - what's included */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {activeMenu !== "daily" ? (
            /* Buffet content - Sushi + Cocina categories */
            <div className="py-[clamp(60px,8vw,100px)] px-10 bg-white">
              <div className="max-w-[1200px] mx-auto">
                <FadeIn>
                  <div className="text-center mb-14">
                    <p className="font-body text-xs tracking-[5px] uppercase text-camel mb-3">
                      {t("includedSub")}
                    </p>
                    <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon mb-3">
                      {t("includedTitle")}
                    </h2>
                    <DiamondDivider />
                  </div>
                </FadeIn>

                {/* Two columns: Sushi + Cocina */}
                <div className="grid grid-cols-2 gap-16 max-md:grid-cols-1">
                  {/* Sushi */}
                  <FadeIn>
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-[28px] font-light text-maroon">
                          {t("sushiTitle")}
                        </h3>
                        <div className="flex-1 h-px bg-beige" />
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-sm:grid-cols-1">
                        {SUSHI_CATEGORIES.map((cat) => (
                          <div
                            key={cat}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-1.5 h-1.5 bg-camel rotate-45 shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="font-body text-[15px] text-ink font-light">
                              {t(`sushi.${cat}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>

                  {/* Cocina */}
                  <FadeIn delay={0.15}>
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-[28px] font-light text-maroon">
                          {t("cocinaTitle")}
                        </h3>
                        <div className="flex-1 h-px bg-beige" />
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-sm:grid-cols-1">
                        {COCINA_CATEGORIES.map((cat) => (
                          <div
                            key={cat}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-1.5 h-1.5 bg-camel rotate-45 shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="font-body text-[15px] text-ink font-light">
                              {t(`cocina.${cat}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                </div>

                {/* Buffet note */}
                <FadeIn delay={0.3}>
                  <div className="mt-14 text-center">
                    <p className="font-body text-[13px] text-gray font-light">
                      {t("buffetNote")}
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          ) : (
            /* Daily menu content */
            <div className="py-[clamp(60px,8vw,100px)] px-10 bg-white">
              <div className="max-w-[700px] mx-auto text-center">
                <FadeIn>
                  <p className="font-body text-xs tracking-[5px] uppercase text-camel mb-3">
                    {t("dailyDetailSub")}
                  </p>
                  <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon mb-3">
                    {t("dailyDetailTitle")}
                  </h2>
                  <DiamondDivider />
                  <div className="mt-10 space-y-6">
                    {["dailyItem1", "dailyItem2", "dailyItem3"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className="flex items-center gap-6 justify-center"
                        >
                          <div className="w-8 h-px bg-camel" />
                          <span className="text-[20px] font-light text-maroon">
                            {t(item)}
                          </span>
                          <div className="w-8 h-px bg-camel" />
                        </div>
                      )
                    )}
                  </div>
                  <p className="font-body text-[13px] text-gray font-light mt-8">
                    {t("dailyNote")}
                  </p>
                </FadeIn>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gallery strip */}
      <div className="py-[clamp(40px,6vw,60px)] px-10 bg-cream">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-6 gap-3 max-md:grid-cols-3">
            {GALLERY_IMAGES.map((src, i) => (
              <FadeIn key={src} delay={i * 0.08}>
                <div className="relative h-[180px] overflow-hidden group">
                  <Image
                    src={src}
                    alt={`Food ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
