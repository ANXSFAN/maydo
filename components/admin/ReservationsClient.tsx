"use client";

import { useAdminLang } from "./AdminLangContext";
import StatusSelect from "./StatusSelect";

type Reservation = {
  id: string; name: string; email: string; phone: string;
  date: string; time: string; guests: number; period: string;
  notes: string | null; status: string; createdAt: string;
};

export default function ReservationsClient({ reservations }: { reservations: Reservation[] }) {
  const { t } = useAdminLang();

  const fmtDate = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(s));
  const fmtTime = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(s));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">{t("reservationsTitle")}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{t("reservationsCount", { count: reservations.length })}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[t("client"), t("date"), t("time"), t("guests"), t("shift"), t("status"), t("created")].map((h) => (
                <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-gray-900">{r.name}</div>
                  <div className="text-[12px] text-gray-400">{r.email}</div>
                  <div className="text-[12px] text-gray-400">{r.phone}</div>
                </td>
                <td className="px-6 py-4 text-[14px] text-gray-700">{fmtDate(r.date)}</td>
                <td className="px-6 py-4 text-[14px] text-gray-700 font-medium">{r.time}</td>
                <td className="px-6 py-4 text-[14px] text-gray-700">{r.guests}</td>
                <td className="px-6 py-4 text-[13px] text-gray-600 capitalize">{r.period}</td>
                <td className="px-6 py-4">
                  <StatusSelect table="reservation" id={r.id} currentStatus={r.status} options={["pending", "confirmed", "cancelled"]} />
                </td>
                <td className="px-6 py-4 text-[12px] text-gray-400">{fmtTime(r.createdAt)}</td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">{t("noReservationsYet")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {reservations.filter((r) => r.notes).length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">{t("customerNotes")}</h2>
          <div className="space-y-3">
            {reservations.filter((r) => r.notes).map((r) => (
              <div key={r.id} className="flex gap-3 text-[13px]">
                <span className="font-medium text-gray-700 shrink-0">{r.name}:</span>
                <span className="text-gray-500">{r.notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
