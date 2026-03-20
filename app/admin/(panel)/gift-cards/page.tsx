import { prisma } from "@/lib/prisma";
import GiftCardsClient from "@/components/admin/GiftCardsClient";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <GiftCardsClient
      giftCards={giftCards.map((gc) => ({
        ...gc,
        amount: Number(gc.amount),
        balance: Number(gc.balance),
        sendDate: gc.sendDate?.toISOString() ?? null,
        createdAt: gc.createdAt.toISOString(),
      }))}
    />
  );
}
