"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const ELFSIGHT_APP_ID = process.env.NEXT_PUBLIC_ELFSIGHT_APP_ID || "";

export default function InstagramFeed() {
  const t = useTranslations("Instagram");
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sushi-maydo-cookie-consent");
    if (consent === "all") setConsentGranted(true);

    const handleConsent = () => setConsentGranted(true);
    window.addEventListener("cookie-consent-granted", handleConsent);
    return () => window.removeEventListener("cookie-consent-granted", handleConsent);
  }, []);

  if (!ELFSIGHT_APP_ID) return null;

  return (
    <section className="bg-white py-[clamp(80px,12vw,160px)] px-5 sm:px-10">
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
          </div>
        </FadeIn>

        {consentGranted ? (
          <>
            <Script
              src="https://static.elfsight.com/platform/platform.js"
              strategy="lazyOnload"
            />
            <div className={`elfsight-app-${ELFSIGHT_APP_ID}`} data-elfsight-app-lazy />
          </>
        ) : (
          <div className="text-center py-12 border border-beige bg-cream/50">
            <p className="font-body text-sm text-gray">
              {t("consentRequired")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
