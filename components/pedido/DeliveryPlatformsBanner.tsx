"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const PLATFORMS = [
  { key: "uberEats", color: "#06C167" },
  { key: "glovo", color: "#FFC244" },
  { key: "justEat", color: "#FF8000" },
] as const;

export default function DeliveryPlatformsBanner() {
  const t = useTranslations("Pedido");
  const f = useTranslations("Footer");

  const activePlatforms = PLATFORMS
    .map(({ key, color }) => ({ key, color, url: f(`${key}Url`) }))
    .filter((p) => p.url && p.url !== "#");

  if (activePlatforms.length === 0) return null;

  return (
    <section className="bg-beige/40 border-y border-beige py-[clamp(28px,5vw,48px)] px-[clamp(16px,4vw,40px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left flex-1"
          >
            <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
              {t("deliveryAlsoSub")}
            </p>
            <h3 className="text-[20px] sm:text-[24px] font-light text-maroon leading-snug">
              {t("deliveryAlsoTitle")}
            </h3>
            <p className="font-body text-[13px] text-gray font-light mt-2 max-w-[480px] mx-auto lg:mx-0">
              {t("deliveryAlsoDesc")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {activePlatforms.map(({ key, color, url }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 px-5 py-3 bg-white border border-beige font-body text-[13px] tracking-[1.5px] uppercase no-underline text-maroon transition-all duration-300 hover:border-maroon hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(122,66,66,0.15)]"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{ background: color }}
                />
                {f(key)}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
