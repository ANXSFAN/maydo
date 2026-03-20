"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import DiamondDivider from "@/components/ui/DiamondDivider";

const socials = ["Instagram", "Facebook", "Google"];

const pageLinks = [
  { key: "menu", href: "/carta" },
  { key: "reservations", href: "/reservas" },
  { key: "order", href: "/pedido" },
  { key: "delivery", href: "/delivery" },
  { key: "giftCard", href: "/gift-card" },
  { key: "gallery", href: "/galeria" },
  { key: "about", href: "/sobre" },
] as const;

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");

  return (
    <footer id="footer" className="bg-maroon-dark pt-20 pb-10 px-10 text-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-[60px] mb-[60px] max-md:grid-cols-1 max-md:text-center">
          {/* Brand */}
          <div>
            <Link href="/" className="no-underline inline-block mb-3">
              <Image
                src="/images/logo.svg"
                alt="Sushi Maydo"
                width={80}
                height={80}
                className="brightness-0 invert"
              />
            </Link>
            <DiamondDivider className="text-camel/30" />
            <p className="font-body text-[13px] text-white/40 leading-relaxed font-light max-w-[300px] max-md:mx-auto">
              {t("tagline")}
            </p>
            {/* Page links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 max-md:justify-center">
              {pageLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="font-body text-xs text-white/30 no-underline tracking-wider transition-colors hover:text-camel"
                >
                  {link.key === "menu" || link.key === "reservations" || link.key === "gallery"
                    ? nav(link.key)
                    : t(link.key)}
                </Link>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-body text-[11px] tracking-[3px] text-camel mb-6 font-normal">
              {t("hours")}
            </h4>
            {(["hours1", "hours2", "hours3", "hours4"] as const).map((key) => (
              <p
                key={key}
                className="font-body text-[13px] text-white/50 leading-8 font-light"
              >
                {t(key)}
              </p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-[11px] tracking-[3px] text-camel mb-6 font-normal">
              {t("contact")}
            </h4>
            <p className="font-body text-[13px] text-white/50 leading-8 font-light">
              <a href={`tel:${t("phone")}`} className="text-white/50 no-underline transition-colors hover:text-camel">
                {t("phone")}
              </a>
            </p>
            <p className="font-body text-[13px] text-white/50 leading-8 font-light break-all">
              <a href={`mailto:${t("email")}`} className="text-white/50 no-underline transition-colors hover:text-camel">
                {t("email")}
              </a>
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-body text-[11px] tracking-[3px] text-camel mb-6 font-normal">
              {t("location")}
            </h4>
            <p className="font-body text-[13px] text-white/50 leading-8 font-light whitespace-pre-line">
              {t("address")}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] pt-[30px] flex justify-between items-center flex-wrap gap-4">
          <p className="font-body text-xs text-white/25 font-light">
            {t("copyright")}
          </p>
          <div className="flex gap-6">
            {socials.map((s) => (
              <a
                key={s}
                href="#"
                className="font-body text-xs text-white/30 no-underline tracking-wider transition-colors hover:text-camel"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
