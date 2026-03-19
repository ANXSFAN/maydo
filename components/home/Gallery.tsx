"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const GALLERY_IMAGES = {
  gallery1: "/images/gallery1.jpg",
  gallery2: "/images/gallery2.jpg",
  gallery3: "/images/gallery3.jpeg",
  gallery4: "/images/gallery4.jpeg",
};

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
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          sizes="(max-width: 768px) 50vw, 400px"
        />
        <div className="absolute inset-0 bg-maroon/0 transition-colors duration-500 group-hover:bg-maroon/25" />
      </div>
    </FadeIn>
  );
}

export default function Gallery() {
  const t = useTranslations("Gallery");

  return (
    <section
      id="gallery"
      className="py-[clamp(80px,10vw,120px)] px-10 bg-cream"
    >
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

        <div className="grid grid-cols-3 grid-rows-[240px_240px] gap-4 max-md:grid-cols-2 max-md:grid-rows-[200px_200px_200px]">
          <GalleryItem
            src={GALLERY_IMAGES.gallery1}
            className="row-span-2 max-md:row-span-1"
            delay={0}
          />
          <GalleryItem src={GALLERY_IMAGES.gallery2} delay={0.1} />
          <GalleryItem src={GALLERY_IMAGES.gallery3} delay={0.2} />
          <GalleryItem
            src={GALLERY_IMAGES.gallery4}
            className="col-span-2 max-md:col-span-1"
            delay={0.15}
          />
        </div>
      </div>
    </section>
  );
}
