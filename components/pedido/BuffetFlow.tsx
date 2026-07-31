"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const PRICE_GROUPS = [
  {
    meal: "tarde" as const,
    adultPrice: "17,90 €",
    childPrice: "10,90 €",
  },
  {
    meal: "noche" as const,
    adultPrice: "22,90 €",
    childPrice: "12,90 €",
  },
];

export default function BuffetFlow() {
  const t = useTranslations("Buffet");

  return (
    <div className="max-w-[860px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-9 sm:mb-12"
      >
        <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-3">
          {t("pricesEyebrow")}
        </p>
        <h3 className="text-[28px] sm:text-[38px] font-light text-night-text mb-4">
          {t("pricesTitle")}
        </h3>
        <p className="font-body text-[14px] sm:text-[15px] text-night-text-dim font-light leading-relaxed max-w-[560px] mx-auto">
          {t("pricesDesc")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {PRICE_GROUPS.map((group, index) => (
          <motion.article
            key={group.meal}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + index * 0.08 }}
            className="relative overflow-hidden bg-night-soft border border-night-border"
          >
            <div className="h-[3px] bg-camel" />
            <header className="px-6 sm:px-8 pt-7 sm:pt-8 pb-6 border-b border-night-border">
              <p className="font-body text-[10px] tracking-[2.5px] uppercase text-camel mb-2">
                {t(`${group.meal}Hours`)}
              </p>
              <h4 className="text-[27px] sm:text-[31px] font-light text-night-text mb-2">
                {t(`${group.meal}Title`)}
              </h4>
              <p className="font-body text-[13px] text-night-text-dim font-light leading-relaxed">
                {t(`${group.meal}Desc`)}
              </p>
            </header>

            <div className="divide-y divide-night-border">
              <div className="px-6 sm:px-8 py-6 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[19px] font-light text-night-text mb-1">
                    {t("adultoTitle")}
                  </p>
                  <p className="font-body text-[12px] text-night-text-muted font-light">
                    {t("adultoDesc")}
                  </p>
                </div>
                <p className="text-[27px] sm:text-[31px] font-light text-camel whitespace-nowrap">
                  {group.adultPrice}
                </p>
              </div>
              <div className="px-6 sm:px-8 py-6 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[19px] font-light text-night-text mb-1">
                    {t("ninoTitle")}
                  </p>
                  <p className="font-body text-[12px] text-night-text-muted font-light">
                    {t("ninoDesc")}
                  </p>
                </div>
                <p className="text-[27px] sm:text-[31px] font-light text-camel whitespace-nowrap">
                  {group.childPrice}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.28 }}
        className="mt-6 sm:mt-8 border border-camel/35 bg-camel/[0.06] px-5 sm:px-7 py-5 flex items-center gap-5 sm:gap-7"
      >
        <div className="shrink-0 w-[72px] sm:w-[84px] border-r border-camel/40 pr-5 sm:pr-7 text-center">
          <span className="block text-[22px] sm:text-[25px] font-light text-camel leading-none">
            1,40 m
          </span>
          <span className="block mt-2 font-body text-[9px] tracking-[2px] uppercase text-night-text-muted">
            {t("heightLabel")}
          </span>
        </div>
        <div>
          <h4 className="text-[17px] sm:text-[19px] font-light text-night-text mb-1">
            {t("heightRuleTitle")}
          </h4>
          <p className="font-body text-[12px] sm:text-[13px] text-night-text-dim font-light leading-relaxed">
            {t("heightRuleDesc")}
          </p>
        </div>
      </motion.aside>
    </div>
  );
}
