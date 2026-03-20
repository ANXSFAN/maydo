import { prisma } from "@/lib/prisma";
import ReservationsClient from "@/components/admin/ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ReservationsClient
      reservations={reservations.map((r) => ({
        ...r,
        date: r.date.toISOString(),
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
