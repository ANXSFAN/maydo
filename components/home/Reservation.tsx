"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const RESERVE_IMAGE = "/微信图片_20260319233258_524_1520.jpg";

export default function Reservation() {
  const t = useTranslations("Reserve");

  return (
    <section id="reserve" className="py-[clamp(80px,12vw,160px)] px-10 bg-white">
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

            <div className="bg-cream p-[clamp(24px,4vw,48px)] border border-beige">
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-0">
                <div className="col-span-2">
                  <input
                    className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("name")}
                  />
                </div>
                <div>
                  <input
                    className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("email")}
                  />
                </div>
                <div>
                  <input
                    className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("phone")}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                  />
                </div>
                <div>
                  <select className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon cursor-pointer">
                    <option>{t("time")}</option>
                    <option>13:00</option>
                    <option>13:30</option>
                    <option>14:00</option>
                    <option>14:30</option>
                    <option>20:30</option>
                    <option>21:00</option>
                    <option>21:30</option>
                    <option>22:00</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <select className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon cursor-pointer">
                    <option>{t("guests")}</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6+</option>
                  </select>
                </div>
              </div>

              <button className="w-full mt-9 px-12 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)]">
                {t("btn")}
              </button>
              <p className="font-body text-xs text-gray text-center mt-4 font-light">
                {t("note")}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
