"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const GALLERY_IMAGES = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
  "/images/gallery-9.jpg",
];

export default function Gallery() {
  const t = useTranslations("Gallery");
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive(index);
    },
    [active]
  );

  const goPrev = () =>
    goTo((active - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  const goNext = () => goTo((active + 1) % GALLERY_IMAGES.length);

  return (
    <section
      id="gallery"
      className="py-[clamp(80px,10vw,140px)] px-10 bg-cream relative overflow-hidden"
    >
      {/* Decorative kanji watermark */}
      <div className="absolute top-[10%] right-[5%] text-[200px] font-light text-maroon/[0.03] font-cjk select-none leading-none">
        美
      </div>

      <div className="max-w-[1100px] mx-auto">
        <FadeIn>
          <div className="text-center mb-[60px]">
            <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
              {t("sub")}
            </p>
            <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
              {t("title")}
            </h2>
            <DiamondDivider />
          </div>
        </FadeIn>

        <FadeIn>
          {/* Main showcase with side previews */}
          <div className="flex gap-4 items-stretch h-[500px] max-md:h-[350px]">
            {/* Previous image peek */}
            <button
              onClick={goPrev}
              className="relative shrink-0 w-[80px] max-md:w-[40px] overflow-hidden cursor-pointer border-0 p-0 group"
            >
              <Image
                src={
                  GALLERY_IMAGES[
                    (active - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
                  ]
                }
                alt="Previous"
                fill
                className="object-cover brightness-50 transition-all duration-500 group-hover:brightness-75"
                sizes="80px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-white/60 transition-colors group-hover:text-white"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </button>

            {/* Center — main image */}
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={GALLERY_IMAGES[active]}
                    alt={`Gallery ${active + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 900px"
                    priority={active === 0}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Subtle vignette overlay */}
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.15)] pointer-events-none z-[1]" />

              {/* Counter badge */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-body text-[11px] text-white/70 tracking-[4px] z-[2]">
                {String(active + 1).padStart(2, "0")}{" "}
                <span className="text-camel mx-1">◇</span>{" "}
                {String(GALLERY_IMAGES.length).padStart(2, "0")}
              </div>
            </div>

            {/* Next image peek */}
            <button
              onClick={goNext}
              className="relative shrink-0 w-[80px] max-md:w-[40px] overflow-hidden cursor-pointer border-0 p-0 group"
            >
              <Image
                src={GALLERY_IMAGES[(active + 1) % GALLERY_IMAGES.length]}
                alt="Next"
                fill
                className="object-cover brightness-50 transition-all duration-500 group-hover:brightness-75"
                sizes="80px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-white/60 transition-colors group-hover:text-white"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="mt-5 flex justify-center gap-2">
            {GALLERY_IMAGES.map((src, i) => (
              <button
                key={src}
                onClick={() => goTo(i)}
                className="relative border-0 p-0 cursor-pointer transition-all duration-400 group"
              >
                <div
                  className={`
                    relative w-[100px] max-md:w-[60px] aspect-[4/3] overflow-hidden
                    transition-all duration-400
                    ${i === active ? "opacity-100 scale-100" : "opacity-40 scale-95 hover:opacity-70"}
                  `}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
                {/* Active indicator line */}
                <div
                  className={`
                    h-[2px] mt-2 mx-auto transition-all duration-400
                    ${i === active ? "w-full bg-camel" : "w-0 bg-transparent"}
                  `}
                />
              </button>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
