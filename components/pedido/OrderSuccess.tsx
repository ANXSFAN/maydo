"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import DiamondDivider from "@/components/ui/DiamondDivider";
import { Link } from "@/i18n/navigation";

export default function OrderSuccess() {
  const t = useTranslations("Pedido");
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "";
  const pickupTime = searchParams.get("pickup_time") ?? "";
  const total = searchParams.get("total") ?? "";
  const orderId = searchParams.get("order_id") ?? "";

  useEffect(() => {
    try { localStorage.removeItem("sushi-maydo-cart"); } catch { /* ignore */ }
  }, []);

  const formattedTotal = total
    ? `${parseFloat(total).toFixed(2).replace(".", ",")}€`
    : "";

  return (
    <section className="py-[clamp(40px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-cream">
      <div className="max-w-[520px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h2 className="text-[28px] font-light text-maroon mb-2">
            {t("orderSuccessTitle")}
          </h2>
          <DiamondDivider />

          <div className="mt-6 p-6 bg-cream border border-beige text-left space-y-3">
            {orderId && (
              <div className="flex justify-between font-body text-[14px]">
                <span className="text-gray">{t("orderNumberLabel")}</span>
                <span className="text-maroon font-medium">{orderId}</span>
              </div>
            )}
            {name && (
              <div className="flex justify-between font-body text-[14px]">
                <span className="text-gray">{t("name")}</span>
                <span className="text-maroon">{name}</span>
              </div>
            )}
            {pickupTime && (
              <div className="flex justify-between font-body text-[14px]">
                <span className="text-gray">{t("pickupTime")}</span>
                <span className="text-maroon">{pickupTime}</span>
              </div>
            )}
            {formattedTotal && (
              <div className="flex justify-between font-body text-[14px]">
                <span className="text-gray">{t("total")}</span>
                <span className="text-maroon font-medium">{formattedTotal}</span>
              </div>
            )}
          </div>

          <p className="font-body text-[14px] text-gray font-light mt-6">
            {t("orderSuccessMsg")}
          </p>
          <p className="font-body text-[13px] text-camel font-light mt-2">
            {t("payAtStore")}
          </p>

          <Link
            href="/pedido"
            className="inline-block mt-8 px-10 py-4 bg-maroon text-white font-heading text-[13px] tracking-[3px] uppercase transition-all duration-300 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] no-underline"
          >
            {t("backToMenu")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
