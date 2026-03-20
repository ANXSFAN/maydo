"use client";

import { useAdminLang } from "./AdminLangContext";
import StatusSelect from "./StatusSelect";

type Order = {
  id: string; orderNumber: number; orderType: string; name: string;
  phone: string; email: string; pickupTime: string | null; notes: string | null;
  items: unknown; total: number; discountCode: string | null; discountAmount: number;
  deliveryAddress: unknown; deliveryFee: number; status: string; createdAt: string;
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const { t } = useAdminLang();

  const fmtDT = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">{t("ordersTitle")}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{t("ordersCount", { count: orders.length })}</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const items = o.items as Array<{ name: string; quantity: number; price: number }>;
          const addr = o.deliveryAddress as { street?: string; number?: string; city?: string; postcode?: string } | null;

          return (
            <div key={o.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[20px] font-semibold text-gray-900">#{o.orderNumber}</span>
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${o.orderType === "delivery" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{o.orderType}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900">{o.name}</div>
                  <div className="text-[12px] text-gray-400">{o.phone} · {o.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-semibold text-gray-900">{o.total.toFixed(2)}€</div>
                  {o.discountAmount > 0 && <div className="text-[11px] text-emerald-600">-{o.discountAmount.toFixed(2)}€ ({o.discountCode})</div>}
                </div>
                <StatusSelect table="order" id={o.id} currentStatus={o.status} options={["pending", "preparing", "ready", "completed", "cancelled"]} />
              </div>
              <div className="px-6 py-4 flex gap-8">
                <div className="flex-1">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("items")}</div>
                  <div className="space-y-1">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[13px]">
                        <span className="text-gray-700">{item.name} × {item.quantity}</span>
                        <span className="text-gray-500">{(item.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-[200px] shrink-0 space-y-2 text-[13px]">
                  <div><span className="text-gray-400">{t("orderDate")}: </span><span className="text-gray-700">{fmtDT(o.createdAt)}</span></div>
                  {o.pickupTime && <div><span className="text-gray-400">{t("pickup")}: </span><span className="text-gray-700 font-medium">{o.pickupTime}</span></div>}
                  {addr && <div><span className="text-gray-400">{t("address")}: </span><span className="text-gray-700">{addr.street} {addr.number}, {addr.postcode} {addr.city}</span></div>}
                  {o.deliveryFee > 0 && <div><span className="text-gray-400">{t("shipping")}: </span><span className="text-gray-700">{o.deliveryFee.toFixed(2)}€</span></div>}
                  {o.notes && <div><span className="text-gray-400">{t("notes")}: </span><span className="text-gray-700 italic">{o.notes}</span></div>}
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">{t("noOrdersYet")}</div>}
      </div>
    </>
  );
}
