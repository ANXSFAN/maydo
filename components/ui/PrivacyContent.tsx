"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function PrivacyContent() {
  const t = useTranslations("Privacy");

  const sections = [
    { title: t("section1Title"), body: t("section1Body") },
    { title: t("section2Title"), body: t("section2Body") },
    { title: t("section3Title"), body: t("section3Body") },
    { title: t("section4Title"), body: t("section4Body") },
    { title: t("section5Title"), body: t("section5Body") },
    { title: t("section6Title"), body: t("section6Body") },
    { title: t("section7Title"), body: t("section7Body") },
  ];

  return (
    <section className="bg-cream py-[clamp(60px,10vw,120px)]">
      <div className="max-w-[800px] mx-auto px-5 sm:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-sm text-gray mb-10"
        >
          {t("lastUpdated")}
        </motion.p>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <h2 className="font-heading text-xl text-ink font-semibold mb-3">
                {s.title}
              </h2>
              <p className="font-body text-sm text-ink/70 leading-7 whitespace-pre-line">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
