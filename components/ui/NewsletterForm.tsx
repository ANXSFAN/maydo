"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-maroon py-16 px-5 sm:px-10">
      <div className="max-w-[600px] mx-auto text-center">
        <FadeIn>
          <p className="font-body text-xs tracking-[5px] uppercase text-camel mb-3">
            {t("sub")}
          </p>
          <h2 className="text-[clamp(24px,3vw,32px)] font-light text-white mb-3">
            {t("title")}
          </h2>
          <p className="font-body text-sm text-white/60 mb-8 leading-relaxed">
            {t("desc")}
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body text-sm text-camel"
              >
                {t("success")}
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex gap-3 max-sm:flex-col"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                  placeholder={t("placeholder")}
                  className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 text-white font-body text-sm outline-none placeholder:text-white/40 focus:border-camel/60 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-8 py-3.5 bg-camel text-maroon-dark font-body text-xs tracking-[2px] uppercase border-none cursor-pointer hover:bg-camel-light transition-colors disabled:opacity-60 shrink-0"
                >
                  {status === "loading" ? t("sending") : t("btn")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === "error" && (
            <p className="font-body text-xs text-red-300 mt-3">
              {t("error")}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
