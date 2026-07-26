"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

type Meal = "tarde" | "noche";
type Audience = "adulto" | "nino";

// PDF 映射 — 客户提供真 PDF 后把 null 改成 "/menus/xxx.pdf" 即可启用 PDF 视图
const PDF_MAP: Record<`${Meal}-${Audience}`, string | null> = {
  "tarde-adulto": null,
  "tarde-nino": null,
  "noche-adulto": null,
  "noche-nino": null,
};

const PHONE = "+34 665 128 006";
const PHONE_TEL = "+34665128006";

export default function BuffetFlow() {
  const t = useTranslations("Buffet");
  const [meal, setMeal] = useState<Meal | null>(null);
  const [audience, setAudience] = useState<Audience | null>(null);

  const step = !meal ? 1 : !audience ? 2 : 3;
  const pdfUrl = meal && audience ? PDF_MAP[`${meal}-${audience}`] : null;
  const pdfReady = !!pdfUrl;

  const reset = () => {
    setMeal(null);
    setAudience(null);
  };

  const goBack = () => {
    if (audience) setAudience(null);
    else if (meal) setMeal(null);
  };

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-[3px] w-12 transition-colors duration-300 ${
              s <= step ? "bg-camel" : "bg-night-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — Meal time */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-body text-[11px] tracking-[3px] uppercase text-camel text-center mb-3">
              {t("step1Sub")}
            </p>
            <h3 className="text-[24px] sm:text-[30px] font-light text-night-text text-center mb-10">
              {t("step1Title")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {(["tarde", "noche"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className="group relative overflow-hidden bg-night-soft border border-night-border hover:border-camel transition-all duration-400 p-8 sm:p-10 text-left cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-camel scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <p className="font-body text-[10px] tracking-[3px] uppercase text-camel mb-2">
                    {t(`${m}Hours`)}
                  </p>
                  <h4 className="text-[26px] sm:text-[32px] font-light text-night-text mb-2">
                    {t(`${m}Title`)}
                  </h4>
                  <p className="font-body text-[13px] text-night-text-dim font-light leading-relaxed">
                    {t(`${m}Desc`)}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-5 font-body text-[11px] tracking-[2px] uppercase text-camel">
                    {t("choose")}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2 — Audience */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-body text-[11px] tracking-[3px] uppercase text-camel text-center mb-3">
              {t("step2Sub")} · {t(`${meal}Title`)}
            </p>
            <h3 className="text-[24px] sm:text-[30px] font-light text-night-text text-center mb-10">
              {t("step2Title")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {(["adulto", "nino"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className="group relative overflow-hidden bg-night-soft border border-night-border hover:border-camel transition-all duration-400 p-8 sm:p-10 text-left cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-camel scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <h4 className="text-[26px] sm:text-[32px] font-light text-night-text mb-2">
                    {t(`${a}Title`)}
                  </h4>
                  <p className="font-body text-[13px] text-night-text-dim font-light leading-relaxed">
                    {t(`${a}Desc`)}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-5 font-body text-[11px] tracking-[2px] uppercase text-camel">
                    {t("choose")}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={goBack}
                className="font-body text-[12px] tracking-[2px] uppercase text-night-text-dim hover:text-camel transition-colors bg-transparent border-none cursor-pointer"
              >
                ← {t("back")}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — PDF viewer or pending placeholder */}
        {step === 3 && meal && audience && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <p className="font-body text-[10px] tracking-[3px] uppercase text-camel mb-1">
                  {t(`${meal}Title`)} · {t(`${audience}Title`)}
                </p>
                <h3 className="text-[22px] sm:text-[26px] font-light text-night-text">
                  {pdfReady ? t("pdfTitle") : t("pdfPendingTitle")}
                </h3>
              </div>
              <div className="flex gap-2">
                {pdfReady && pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 border border-camel/40 text-camel hover:bg-camel/10 hover:border-camel font-body text-[11px] tracking-[2px] uppercase no-underline transition-colors"
                  >
                    {t("openNewTab")}
                  </a>
                )}
                <button
                  onClick={reset}
                  className="px-4 py-2.5 border border-night-border text-night-text-dim hover:border-camel hover:text-camel bg-transparent font-body text-[11px] tracking-[2px] uppercase cursor-pointer transition-colors"
                >
                  {t("restart")}
                </button>
              </div>
            </div>

            {pdfReady && pdfUrl ? (
              <>
                <div className="bg-night-soft border border-night-border overflow-hidden">
                  <iframe
                    src={`${pdfUrl}#zoom=page-width`}
                    title={t("pdfTitle")}
                    className="w-full h-[85vh] min-h-[640px] bg-night-soft"
                  />
                </div>
                <p className="font-body text-[11px] text-night-text-muted text-center mt-4 font-light">
                  {t("pdfPlaceholderNote")}
                </p>
              </>
            ) : (
              <div className="bg-night-soft border border-night-border px-6 sm:px-12 py-14 sm:py-20 text-center">
                <div className="mx-auto mb-6 h-14 w-14 rounded-full border border-camel/40 flex items-center justify-center">
                  <svg className="h-6 w-6 text-camel" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </div>
                <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-3">
                  {t("pdfPendingLabel")}
                </p>
                <h4 className="text-[22px] sm:text-[28px] font-light text-night-text mb-4">
                  {t("pdfPendingTitle")}
                </h4>
                <p className="font-body text-[14px] sm:text-[15px] text-night-text-dim font-light leading-relaxed max-w-[460px] mx-auto mb-8">
                  {t("pdfPendingDesc")}
                </p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-camel text-night hover:bg-camel/90 font-body text-[11px] tracking-[2px] uppercase no-underline transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {PHONE}
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
