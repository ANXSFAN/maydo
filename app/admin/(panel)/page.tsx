import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalReservations,
    pendingReservations,
    totalOrders,
    pendingOrders,
    unreadContacts,
    totalGiftCards,
    recentReservations,
    recentOrders,
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.contact.count({ where: { read: false } }),
    prisma.giftCard.count(),
    prisma.reservation.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <DashboardClient
      data={{
        totalReservations,
        pendingReservations,
        totalOrders,
        pendingOrders,
        unreadContacts,
        totalGiftCards,
        recentReservations: recentReservations.map((r) => ({
          ...r,
          date: r.date.toISOString(),
          createdAt: r.createdAt.toISOString(),
        })),
        recentOrders: recentOrders.map((o) => ({
          ...o,
          total: Number(o.total),
          discountAmount: Number(o.discountAmount),
          deliveryFee: Number(o.deliveryFee),
          createdAt: o.createdAt.toISOString(),
        })),
      }}
    />
  );
}
