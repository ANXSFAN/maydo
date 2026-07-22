"use client";

import { useTranslations } from "next-intl";

const PHONE_DISPLAY = "+34 936 844 036";
const PHONE_NUMBER = "+34936844036";
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER.replace("+", "")}`;

export default function ReservationContactOptions() {
  const t = useTranslations("ReservationContact");

  return (
    <div className="bg-night-card border border-beige p-[clamp(28px,5vw,56px)]">
      <div className="max-w-[620px]">
        <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-3">
          {t("eyebrow")}
        </p>
        <h3 className="text-[clamp(25px,3vw,34px)] font-light text-ink leading-tight">
          {t("title")}
        </h3>
        <p className="font-body text-[15px] text-gray leading-relaxed font-light mt-4">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-9 max-sm:grid-cols-1">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-[128px] items-center gap-5 border border-beige bg-cream px-6 py-5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[#25D366] hover:shadow-[0_12px_32px_rgba(37,211,102,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
          aria-label={t("whatsappAria")}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785a9.87 9.87 0 0 1-5.034-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884M20.464 3.488A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </span>
          <span>
            <span className="block font-heading text-[19px] text-ink transition-colors group-hover:text-[#25D366]">
              {t("whatsapp")}
            </span>
            <span className="mt-1 block font-body text-[13px] font-light text-gray">
              {t("whatsappHint")}
            </span>
          </span>
        </a>

        <a
          href={`tel:${PHONE_NUMBER}`}
          className="group flex min-h-[128px] items-center gap-5 border border-beige bg-cream px-6 py-5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-camel hover:shadow-[0_12px_32px_rgba(201,168,124,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-camel"
          aria-label={t("phoneAria")}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-maroon text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102A1.125 1.125 0 0 0 5.872 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
          </span>
          <span>
            <span className="block font-heading text-[19px] text-ink transition-colors group-hover:text-camel">
              {t("phone")}
            </span>
            <span className="mt-1 block font-body text-[13px] font-light text-gray">
              {PHONE_DISPLAY}
            </span>
          </span>
        </a>
      </div>

      <p className="mt-6 border-t border-beige pt-5 font-body text-[12px] font-light leading-relaxed text-gray">
        {t("notice")}
      </p>
    </div>
  );
}
