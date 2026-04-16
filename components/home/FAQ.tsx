"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

export default function FAQ() {
  const t = useTranslations("FAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-[clamp(80px,12vw,160px)] px-5 sm:px-10">
      <div className="max-w-[800px] mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="font-body text-xs tracking-[5px] uppercase text-camel mb-3">
              {t("sub")}
            </p>
            <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon mb-3">
              {t("title")}
            </h2>
            <DiamondDivider />
          </div>
        </FadeIn>

        <div className="space-y-0">
          {FAQ_KEYS.map((key, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeIn key={key} delay={i * 0.05}>
                <div className="border-b border-beige">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-1 text-left cursor-pointer bg-transparent border-none group"
                  >
                    <span className="font-body text-[15px] text-maroon font-normal pr-4 group-hover:text-maroon-dark transition-colors">
                      {t(`${key}Question`)}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-camel text-xl shrink-0 leading-none"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="font-body text-sm text-ink/60 leading-7 pb-5 px-1">
                          {t(`${key}Answer`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
