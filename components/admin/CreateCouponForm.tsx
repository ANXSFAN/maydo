"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "./AdminLangContext";

export default function CreateCouponForm() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    setLoading(true);

    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrder: minOrder ? Number(minOrder) : null,
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });

    setCode(""); setDiscountValue(""); setMinOrder(""); setMaxUses("");
    setLoading(false); setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        {t("newCoupon")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-gray-900">{t("createCoupon")}</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-[18px]">×</button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{t("code")}</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-mono uppercase" placeholder="CODIGO10" required />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{t("type")}</label>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 bg-white">
            <option value="percentage">{t("percentage")}</option>
            <option value="fixed">{t("fixed")}</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{t("value")}</label>
          <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400" placeholder={discountType === "percentage" ? "20" : "5.00"} required />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{t("minOrder")} (€)</label>
          <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400" placeholder="40" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{t("maxUses")}</label>
          <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400" placeholder="∞" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-[13px] text-gray-600 bg-transparent border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">{t("cancel")}</button>
        <button type="submit" disabled={loading} className="px-5 py-2 text-[13px] text-white bg-gray-900 border-none rounded-lg cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">{loading ? t("creating") : t("create")}</button>
      </div>
    </form>
  );
}
