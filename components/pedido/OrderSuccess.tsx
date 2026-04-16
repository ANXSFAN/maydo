"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import DiamondDivider from "@/components/ui/DiamondDivider";
import { Link } from "@/i18n/navigation";

export default function OrderSuccess() {
  const t = useTranslations("Pedido");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error"
  );
  const [orderInfo, setOrderInfo] = useState<{
    name: string;
    pickup_time: string;
    order_type: string;
    total: string;
  } | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/checkout/status?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "complete") {
          setOrderInfo(data.metadata);
          setStatus("success");
          // Clear cart
          localStorage.removeItem("sushi-maydo-cart");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <section className="py-[clamp(40px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-cream">
      <div className="max-w-[520px] mx-auto text-center">
        {status === "loading" && (
          <div className="py-16">
            <div className="w-10 h-10 border-2 border-beige border-t-maroon rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body text-[14px] text-gray font-light">
              {t("verifyingPayment")}
            </p>
          </div>
        )}

        {status === "success" && (
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <h2 className="text-[28px] font-light text-maroon mb-2">
              {t("paymentSuccessTitle")}
            </h2>
            <DiamondDivider />

            {orderInfo && (
              <div className="mt-6 p-6 bg-white border border-beige text-left space-y-3">
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-gray">{t("name")}</span>
                  <span className="text-maroon">{orderInfo.name}</span>
                </div>
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-gray">
                    {orderInfo.order_type === "delivery"
                      ? t("deliveryTime")
                      : t("pickupTime")}
                  </span>
                  <span className="text-maroon">{orderInfo.pickup_time}</span>
                </div>
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-gray">{t("total")}</span>
                  <span className="text-maroon font-medium">
                    {parseFloat(orderInfo.total).toFixed(2).replace(".", ",")}€
                  </span>
                </div>
              </div>
            )}

            <p className="font-body text-[14px] text-gray font-light mt-6">
              {t("paymentSuccessMsg")}
            </p>

            <Link
              href="/pedido"
              className="inline-block mt-8 px-10 py-4 bg-maroon text-white font-heading text-[13px] tracking-[3px] uppercase transition-all duration-300 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] no-underline"
            >
              {t("backToMenu")}
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-[28px] font-light text-maroon mb-2">
              {t("paymentErrorTitle")}
            </h2>
            <p className="font-body text-[14px] text-gray font-light mt-4">
              {t("paymentErrorMsg")}
            </p>
            <Link
              href="/pedido"
              className="inline-block mt-8 px-10 py-4 bg-maroon text-white font-heading text-[13px] tracking-[3px] uppercase transition-all duration-300 hover:bg-maroon-dark no-underline"
            >
              {t("backToMenu")}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
