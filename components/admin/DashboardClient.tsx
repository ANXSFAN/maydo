"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { useAdminLang } from "./AdminLangContext";

type Props = {
  data: {
    totalReservations: number;
    pendingReservations: number;
    totalOrders: number;
    pendingOrders: number;
    unreadContacts: number;
    totalGiftCards: number;
    recentReservations: Array<{ id: string; name: string; guests: number; time: string; status: string; createdAt: string }>;
    recentOrders: Array<{ id: string; orderNumber: number; name: string; orderType: string; total: number; status: string; createdAt: string }>;
  };
};

export default function DashboardClient({ data }: Props) {
  const { t } = useAdminLang();

  const stats = [
    { label: t("pendingReservations"), value: data.pendingReservations, totalNum: data.totalReservations, href: "/admin/reservations", color: "bg-amber-500" },
    { label: t("pendingOrders"), value: data.pendingOrders, totalNum: data.totalOrders, href: "/admin/orders", color: "bg-blue-500" },
    { label: t("unreadMessages"), value: data.unreadContacts, href: "/admin/contacts", color: "bg-violet-500" },
    { label: t("giftCards"), value: data.totalGiftCards, href: "/admin/gift-cards", color: "bg-emerald-500" },
  ];

  const fmtDate = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">{t("dashboardTitle")}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{t("dashboardDesc")}</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow no-underline group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-[16px] font-bold">{s.value}</span>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <div className="text-[13px] text-gray-500">{s.label}</div>
            {s.totalNum !== undefined && <div className="text-[12px] text-gray-400 mt-0.5">{s.totalNum} {t("total")}</div>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">{t("recentReservations")}</h2>
            <Link href="/admin/reservations" className="text-[12px] text-blue-600 no-underline hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentReservations.map((r) => (
              <div key={r.id} className="px-6 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900 truncate">{r.name}</div>
                  <div className="text-[12px] text-gray-400">{fmtDate(r.createdAt)} · {r.guests} {t("pax")} · {r.time}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {data.recentReservations.length === 0 && <div className="px-6 py-8 text-center text-[14px] text-gray-400">{t("noReservations")}</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">{t("recentOrders")}</h2>
            <Link href="/admin/orders" className="text-[12px] text-blue-600 no-underline hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.map((o) => (
              <div key={o.id} className="px-6 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900 truncate">#{o.orderNumber} · {o.name}</div>
                  <div className="text-[12px] text-gray-400">{fmtDate(o.createdAt)} · {o.orderType} · {o.total.toFixed(2)}€</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
            {data.recentOrders.length === 0 && <div className="px-6 py-8 text-center text-[14px] text-gray-400">{t("noOrders")}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
