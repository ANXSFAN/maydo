"use client";

import { useAdminLang } from "./AdminLangContext";
import CouponToggle from "./CouponToggle";
import CreateCouponForm from "./CreateCouponForm";

type Coupon = {
  id: string; code: string; discountType: string;
  discountValue: number | null; minOrder: number | null;
  maxUses: number | null; usedCount: number; active: boolean;
};

export default function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const { t } = useAdminLang();

  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-gray-900">{t("couponsTitle")}</h1>
          <p className="text-[14px] text-gray-500 mt-1">{t("couponsCount", { count: coupons.length })}</p>
        </div>
      </div>

      <CreateCouponForm />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[t("code"), t("discount"), t("minOrder"), t("uses"), t("active")].map((h) => (
                <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4"><span className="font-mono text-[14px] font-semibold text-gray-900 tracking-wider">{c.code}</span></td>
                <td className="px-6 py-4 text-[14px] text-gray-700">
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue?.toFixed(2)}€`}
                  <span className="text-[12px] text-gray-400 ml-1">({c.discountType})</span>
                </td>
                <td className="px-6 py-4 text-[14px] text-gray-700">{c.minOrder ? `${c.minOrder.toFixed(2)}€` : "—"}</td>
                <td className="px-6 py-4 text-[14px] text-gray-700">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-6 py-4"><CouponToggle id={c.id} active={c.active} /></td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">{t("noCouponsYet")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
