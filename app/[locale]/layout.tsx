import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Cormorant_Garamond, Noto_Serif_SC, Zen_Kaku_Gothic_New } from "next/font/google";
import { routing } from "@/i18n/routing";
import CookieConsent from "@/components/ui/CookieConsent";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import Analytics from "@/components/Analytics";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: false,
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-zen-kaku",
  display: "swap",
  preload: false,
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title: {
      default: title,
      template: `%s | Sushi Maydo Santa Eulàlia`,
    },
    description,
    metadataBase: new URL("https://sushimaydo.es"),
    openGraph: {
      title,
      description,
      siteName: "Sushi Maydo Santa Eulàlia",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
      languages: {
        es: "/es",
        en: "/en",
        ca: "/ca",
        zh: "/zh",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    // 门店名带分店后缀 —— Google 上与其他 Sushi Maydo 门店区分 (2026-07 客户反馈)
    name: "Sushi Maydo Santa Eulàlia",
    alternateName: "Sushi Maydo",
    branchCode: "Santa Eulàlia",
    image: "https://sushimaydo.es/images/logo.svg",
    url: "https://sushimaydo.es",
    telephone: "+34936844036",
    email: "sushimaydobcnplazaeuropa@gmail.com",
    servesCuisine: ["Japanese", "Sushi"],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrer Santa Eulàlia, 204",
      addressLocality: "L'Hospitalet de Llobregat",
      addressRegion: "Barcelona",
      postalCode: "08902",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.3662,
      longitude: 2.122,
    },
    // 全周营业（午 + 晚），与 Footer / Contacto 文案保持一致
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "13:00",
        closes: "16:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "20:30",
        closes: "23:30",
      },
    ],

    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "500",
    },
    hasMenu: "https://sushimaydo.es/es/pedido",
    acceptsReservations: "https://sushimaydo.es/es/reservas",
  };

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${notoSerifSC.variable} ${zenKaku.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <WhatsAppButton />
          <CookieConsent />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
