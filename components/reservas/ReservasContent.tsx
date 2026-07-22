"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";
import ReservationContactOptions from "@/components/reservas/ReservationContactOptions";

export default function ReservasContent() {
  const t = useTranslations("Reservas");

  return (
    <section className="bg-cream px-10 py-[clamp(60px,8vw,100px)] max-sm:px-5">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex gap-16 max-lg:flex-col">
          <FadeIn className="min-w-0 flex-1">
            <ReservationContactOptions />
          </FadeIn>

          <FadeIn delay={0.2} className="w-[340px] shrink-0 max-lg:w-full">
            <div className="sticky top-[100px]">
              <div className="mb-6 bg-maroon p-8 text-white">
                <h3 className="mb-5 text-[22px] font-light">{t("hoursTitle")}</h3>
                <DiamondDivider className="text-camel/50" />

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 font-body text-[11px] uppercase tracking-[3px] text-camel">
                      {t("lunchLabel")}
                    </div>
                    <div className="font-body text-[15px] font-light text-white/80">
                      {t("lunchHoursDetail")}
                    </div>
                    <div className="mt-1 font-body text-[13px] font-light text-white/50">
                      {t("lunchDays")}
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  <div>
                    <div className="mb-2 font-body text-[11px] uppercase tracking-[3px] text-camel">
                      {t("dinnerLabel")}
                    </div>
                    <div className="font-body text-[15px] font-light text-white/80">
                      {t("dinnerHoursDetail")}
                    </div>
                    <div className="mt-1 font-body text-[13px] font-light text-white/50">
                      {t("dinnerDays")}
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  <div className="font-body text-[13px] font-light text-white/40">
                    {t("closed")}
                  </div>
                </div>
              </div>

              <div className="border border-beige bg-night-card p-8">
                <h3 className="mb-4 text-[18px] font-light text-maroon">
                  {t("locationTitle")}
                </h3>
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="whitespace-pre-line font-body text-[14px] font-light text-gray">
                    {t("address")}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
