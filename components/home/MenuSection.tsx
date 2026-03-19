"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const FOOD_IMAGES = [
  "/images/menu1.jpeg",
  "/images/menu2.jpeg",
  "/images/menu3.jpeg",
];

export default function MenuSection() {
  const t = useTranslations("Menu");

  const items = [
    {
      title: t("item1Title"),
      desc: t("item1Desc"),
      price: t("item1Price"),
      time: t("item1Time"),
    },
    {
      title: t("item2Title"),
      desc: t("item2Desc"),
      price: t("item2Price"),
      time: t("item2Time"),
    },
    {
      title: t("item3Title"),
      desc: t("item3Desc"),
      price: t("item3Price"),
      time: t("item3Time"),
    },
  ];

  return (
    <section id="menu" className="py-[clamp(80px,10vw,120px)] px-10 bg-white">
      <div className="max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
            {t("sub")}
          </p>
          <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
            {t("title")}
          </h2>
          <DiamondDivider />
          <p className="font-body text-[15px] text-gray leading-relaxed font-light max-w-[540px] mx-auto mb-[60px]">
            {t("desc")}
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 gap-7 max-md:grid-cols-1">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="group bg-white border border-beige transition-all duration-500 cursor-pointer relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(122,66,66,0.12)]">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-camel scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-[2]" />

                <div className="h-[220px] overflow-hidden relative">
                  <Image
                    src={FOOD_IMAGES[i]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>

                <div className="py-8 px-7 pb-9">
                  <div className="font-body text-[11px] text-camel tracking-[3px] mb-4">
                    {item.time}
                  </div>
                  <h3 className="text-[26px] font-normal text-maroon mb-3">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-gray leading-relaxed font-light mb-6">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-px bg-camel" />
                    <span className="text-[28px] font-light text-maroon">
                      {item.price}
                    </span>
                    <div className="w-5 h-px bg-camel" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
