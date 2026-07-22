"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";
import ReservationContactOptions from "@/components/reservas/ReservationContactOptions";

const RESERVE_IMAGE = "/微信图片_20260319233258_524_1520.jpg";

export default function Reservation() {
  const t = useTranslations("Reserve");

  return (
    <section id="reserve" className="py-[clamp(80px,12vw,160px)] px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex gap-[60px] items-stretch max-md:flex-col">
          {/* Image */}
          <FadeIn scale className="shrink-0 basis-[380px] min-h-[500px] max-md:basis-auto">
            <div className="h-full min-h-[500px] relative overflow-hidden">
              <Image
                src={RESERVE_IMAGE}
                alt="Restaurant ambiance"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 380px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/35 to-transparent" />
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.2} className="flex-1 min-w-[300px]">
            <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
              {t("sub")}
            </p>
            <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
              {t("title")}
            </h2>
            <DiamondDivider />
            <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[540px] mb-10">
              {t("desc")}
            </p>

            <ReservationContactOptions />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
