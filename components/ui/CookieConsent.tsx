"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_KEY = "sushi-maydo-cookie-consent";

export default function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept(value: "all" | "essential") {
    localStorage.setItem(COOKIE_KEY, value);
    setVisible(false);
    if (value === "all") {
      window.dispatchEvent(new Event("cookie-consent-granted"));
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-maroon-dark/95 backdrop-blur-sm border-t border-camel/20 px-6 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="font-body text-sm text-white/80 leading-relaxed flex-1">
              {t("message")}{" "}
              <Link
                href="/privacidad"
                className="text-camel underline underline-offset-2 hover:text-camel-light transition-colors"
              >
                {t("learnMore")}
              </Link>
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => accept("essential")}
                className="font-body text-xs tracking-wider text-white/60 border border-white/20 px-5 py-2.5 rounded hover:border-white/40 hover:text-white/80 transition-colors cursor-pointer"
              >
                {t("essentialOnly")}
              </button>
              <button
                onClick={() => accept("all")}
                className="font-body text-xs tracking-wider text-maroon-dark bg-camel px-5 py-2.5 rounded hover:bg-camel-light transition-colors cursor-pointer font-medium"
              >
                {t("acceptAll")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
