"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
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

function GalleryItem({
  src,
  className = "",
  delay = 0,
}: {
  src: string;
  className?: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} scale className={className}>
      <div className="group overflow-hidden cursor-pointer relative w-full h-full">
        <Image
          src={src}
          alt="Gallery"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-maroon/0 transition-all duration-500 group-hover:bg-maroon/20" />
      </div>
    </FadeIn>
  );
}

export default function Gallery() {
  const t = useTranslations("Gallery");

  return (
    <section
      id="gallery"
      className="py-[clamp(80px,10vw,140px)] px-10 bg-cream relative overflow-hidden"
    >
      {/* Decorative kanji watermark */}
      <div className="absolute top-[10%] right-[5%] text-[200px] font-light text-maroon/[0.03] font-cjk select-none leading-none">
        美
      </div>

      <div className="max-w-[1200px] mx-auto">
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

        {/* Masonry-style grid: 3 columns with varied heights */}
        <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <GalleryItem src={GALLERY_IMAGES[0]} className="h-[280px]" delay={0} />
            <GalleryItem src={GALLERY_IMAGES[1]} className="h-[200px]" delay={0.1} />
            <GalleryItem src={GALLERY_IMAGES[2]} className="h-[240px]" delay={0.2} />
          </div>
          {/* Column 2 — offset for stagger effect */}
          <div className="flex flex-col gap-3 mt-10 max-md:mt-0">
            <GalleryItem src={GALLERY_IMAGES[3]} className="h-[220px]" delay={0.05} />
            <GalleryItem src={GALLERY_IMAGES[4]} className="h-[280px]" delay={0.15} />
            <GalleryItem src={GALLERY_IMAGES[5]} className="h-[200px]" delay={0.25} />
          </div>
          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <GalleryItem src={GALLERY_IMAGES[6]} className="h-[200px]" delay={0.1} />
            <GalleryItem src={GALLERY_IMAGES[7]} className="h-[260px]" delay={0.2} />
            <GalleryItem src={GALLERY_IMAGES[8]} className="h-[240px]" delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
