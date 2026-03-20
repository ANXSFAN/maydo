"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

type GalleryCategory = "all" | "ambiente" | "platos" | "equipo";

const IMAGES = [
  { src: "/images/gallery-1.jpg", category: "platos" as const },
  { src: "/images/gallery-2.jpg", category: "ambiente" as const },
  { src: "/images/gallery-3.jpg", category: "platos" as const },
  { src: "/images/gallery-4.jpg", category: "ambiente" as const },
  { src: "/images/gallery-5.jpg", category: "platos" as const },
  { src: "/images/gallery-6.jpg", category: "ambiente" as const },
  { src: "/images/gallery-7.jpg", category: "platos" as const },
  { src: "/images/gallery-8.jpg", category: "equipo" as const },
  { src: "/images/gallery-9.jpg", category: "equipo" as const },
  { src: "/images/menu1.jpeg", category: "platos" as const },
  { src: "/images/menu2.jpeg", category: "platos" as const },
  { src: "/images/menu3.jpeg", category: "platos" as const },
];

const CATEGORIES: GalleryCategory[] = ["all", "ambiente", "platos", "equipo"];

// Masonry-style height classes for visual variety
const HEIGHT_PATTERN = [
  "h-[320px]",
  "h-[400px]",
  "h-[280px]",
  "h-[360px]",
  "h-[300px]",
  "h-[420px]",
  "h-[340px]",
  "h-[380px]",
  "h-[300px]",
  "h-[360px]",
  "h-[280px]",
  "h-[400px]",
];

export default function GaleriaContent() {
  const t = useTranslations("Galeria");
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeCategory === "all"
      ? IMAGES
      : IMAGES.filter((img) => img.category === activeCategory);

  const categoryKeys: Record<GalleryCategory, string> = {
    all: "catAll",
    ambiente: "catAmbiente",
    platos: "catPlatos",
    equipo: "catEquipo",
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = (dir: number) => {
    if (lightboxIndex === null) return;
    const next = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(next);
  };

  return (
    <>
      <section className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
        <div className="max-w-[1200px] mx-auto">
          {/* Category filters */}
          <FadeIn>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-5 py-2.5 text-[12px] tracking-[2px] uppercase font-body font-light border transition-all duration-300 cursor-pointer
                    ${
                      activeCategory === cat
                        ? "bg-maroon text-white border-maroon"
                        : "bg-transparent text-maroon border-beige hover:border-maroon"
                    }
                  `}
                >
                  {t(categoryKeys[cat])}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Masonry grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="columns-3 gap-5 max-md:columns-2 max-sm:columns-1"
            >
              {filtered.map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="mb-5 break-inside-avoid"
                >
                  <div
                    className={`group relative overflow-hidden cursor-pointer ${HEIGHT_PATTERN[i % HEIGHT_PATTERN.length]}`}
                    onClick={() => openLightbox(i)}
                  >
                    <Image
                      src={img.src}
                      alt={`Gallery ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-maroon-dark/0 group-hover:bg-maroon-dark/30 transition-colors duration-500 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-maroon-dark/90 backdrop-blur-md"
              onClick={closeLightbox}
            />

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-2xl"
            >
              ×
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-6 z-10 font-body text-[12px] text-white/40 tracking-[3px]">
              {String(lightboxIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </div>

            {/* Prev */}
            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute left-6 z-10 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 hover:border-white/30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-6 z-10 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 hover:border-white/30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-[85vw] h-[80vh] max-w-[1200px]"
            >
              <Image
                src={filtered[lightboxIndex].src}
                alt={`Gallery ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="85vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
