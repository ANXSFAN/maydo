"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

const GOOGLE_MAPS_EMBED =
  "https://www.google.com/maps?q=Sushi+Maydo,Pl.+d'Europa+102,+L'Hospitalet+de+Llobregat,+Barcelona&output=embed&z=16";

const GOOGLE_MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=Sushi+Maydo+L'Hospitalet+de+Llobregat+Barcelona";

export default function ContactMap() {
  const t = useTranslations("Contact");

  return (
    <section id="contact" className="py-[clamp(80px,12vw,160px)] px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <div className="text-center mb-[60px]">
            <p className="font-body text-xs tracking-[5px] uppercase text-camel font-normal">
              {t("sub")}
            </p>
            <h2 className="text-[clamp(32px,5vw,52px)] font-light text-maroon leading-tight my-3">
              {t("title")}
            </h2>
            <DiamondDivider />
          </div>
        </FadeIn>

        <div className="flex gap-[60px] items-stretch max-md:flex-col">
          {/* Left — Contact info */}
          <FadeIn className="flex-1 min-w-[280px]">
            <div className="space-y-8">
              {/* Address */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full border border-camel/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-camel">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <p className="font-body text-[15px] text-ink/70 leading-relaxed font-normal whitespace-pre-line">
                  {t("address")}
                </p>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-full border border-camel/40 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-camel">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <a href={`tel:${t("phone")}`} className="font-body text-[15px] text-ink/70 font-normal no-underline transition-colors hover:text-maroon">
                  {t("phone")}
                </a>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-full border border-camel/40 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-camel">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                </div>
                <a href={`mailto:${t("email")}`} className="font-body text-[15px] text-ink/70 font-normal no-underline transition-colors hover:text-maroon break-all">
                  {t("email")}
                </a>
              </div>

              {/* Hours */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full border border-camel/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-camel">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-[15px] text-ink/70 font-normal">{t("hours1")}</p>
                  <p className="font-body text-[15px] text-maroon font-normal">{t("hours2")}</p>
                  <p className="font-body text-[13px] text-gray font-normal mt-1">{t("hours3")}</p>
                </div>
              </div>

              {/* CTA */}
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-10 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase no-underline transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)]"
              >
                {t("cta")}
              </a>
            </div>
          </FadeIn>

          {/* Right — Map */}
          <FadeIn delay={0.2} scale className="flex-1 min-w-[280px]">
            <div className="relative h-full min-h-[400px] max-md:min-h-[300px]">
              <iframe
                src={GOOGLE_MAPS_EMBED}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sushi Maydo Location"
              />
              {/* Decorative corner borders — match About section style */}
              <div className="absolute -top-3 -right-3 w-[80px] h-[80px] border border-camel opacity-25 pointer-events-none" />
              <div className="absolute -bottom-3 -left-3 w-[50px] h-[50px] bg-maroon opacity-[0.08] pointer-events-none" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
