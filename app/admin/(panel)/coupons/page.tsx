import { prisma } from "@/lib/prisma";
import CouponsClient from "@/components/admin/CouponsClient";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <CouponsClient
      coupons={coupons.map((c) => ({
        ...c,
        discountValue: c.discountValue ? Number(c.discountValue) : null,
        minOrder: c.minOrder ? Number(c.minOrder) : null,
      }))}
    />
  );
}
