import { prisma } from "@/lib/prisma";
import OrdersClient from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <OrdersClient
      orders={orders.map((o) => ({
        ...o,
        total: Number(o.total),
        discountAmount: Number(o.discountAmount),
        deliveryFee: Number(o.deliveryFee),
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
