"use client";

import { useAdminLang } from "./AdminLangContext";
import StatusBadge from "./StatusBadge";

type GiftCard = {
  id: string; code: string; amount: number; balance: number;
  senderName: string | null; senderEmail: string | null;
  recipientName: string | null; recipientEmail: string | null;
  message: string | null; status: string; createdAt: string;
};

export default function GiftCardsClient({ giftCards }: { giftCards: GiftCard[] }) {
  const { t } = useAdminLang();

  const fmtDate = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(s));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">{t("giftCardsTitle")}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{t("giftCardsCount", { count: giftCards.length })}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[t("code"), t("amount"), t("balance"), t("fromTo"), t("message"), t("status"), t("date")].map((h) => (
                <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {giftCards.map((gc) => (
              <tr key={gc.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4"><span className="font-mono text-[14px] font-semibold text-gray-900 tracking-wider">{gc.code}</span></td>
                <td className="px-6 py-4 text-[14px] text-gray-700 font-medium">{gc.amount.toFixed(2)}€</td>
                <td className="px-6 py-4 text-[14px] text-emerald-600 font-medium">{gc.balance.toFixed(2)}€</td>
                <td className="px-6 py-4">
                  <div className="text-[13px] text-gray-700">{gc.senderName}</div>
                  <div className="text-[12px] text-gray-400">→ {gc.recipientName}</div>
                  <div className="text-[11px] text-gray-400">{gc.recipientEmail}</div>
                </td>
                <td className="px-6 py-4 text-[13px] text-gray-500 max-w-[200px] truncate">{gc.message || "—"}</td>
                <td className="px-6 py-4"><StatusBadge status={gc.status} /></td>
                <td className="px-6 py-4 text-[12px] text-gray-400">{fmtDate(gc.createdAt)}</td>
              </tr>
            ))}
            {giftCards.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">{t("noGiftCardsYet")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
