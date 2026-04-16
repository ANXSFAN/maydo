"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const REVIEW_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-camel text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-20"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function GoogleReviews() {
  const t = useTranslations("Reviews");
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <section className="bg-cream py-[clamp(80px,12vw,160px)] px-5 sm:px-10">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="font-body text-xs tracking-[5px] uppercase text-camel mb-3">
              {t("sub")}
            </p>
            <h2 className="text-[clamp(28px,4vw,42px)] font-light text-maroon mb-3">
              {t("title")}
            </h2>
            <DiamondDivider />
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="text-[32px] font-light text-maroon">4.5</span>
              <div>
                <Stars rating={5} />
                <p className="font-body text-xs text-gray mt-0.5">Google Reviews</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {REVIEW_KEYS.slice(0, visibleCount).map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-beige p-6 flex flex-col"
              >
                <Stars rating={5} />
                <p className="font-body text-sm text-ink/70 leading-7 mt-3 flex-1">
                  &ldquo;{t(`${key}Text`)}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-beige/60">
                  <p className="font-body text-sm text-maroon font-medium">
                    {t(`${key}Author`)}
                  </p>
                  <p className="font-body text-xs text-gray mt-0.5">
                    {t(`${key}Date`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visibleCount < REVIEW_KEYS.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(REVIEW_KEYS.length)}
              className="font-body text-xs tracking-[2px] uppercase text-maroon border border-maroon/30 px-8 py-3 bg-transparent cursor-pointer hover:bg-maroon hover:text-white transition-all duration-300"
            >
              {t("showMore")}
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <a
            href="https://www.google.com/maps/place/Sushi+Maydo/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-camel no-underline hover:underline tracking-wider"
          >
            {t("viewAll")} →
          </a>
        </div>
      </div>
    </section>
  );
}
