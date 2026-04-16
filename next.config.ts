import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "maydo-pied.vercel.app",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:locale(es|en|ca|zh)/delivery",
        destination: "/:locale/pedido",
        permanent: true,
      },
      {
        source: "/delivery",
        destination: "/pedido",
        permanent: true,
      },
      {
        source: "/:locale(es|en|ca|zh)/gift-card",
        destination: "/:locale",
        permanent: false,
      },
      {
        source: "/gift-card",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
