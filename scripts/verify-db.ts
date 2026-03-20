import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const coupons = await prisma.coupon.findMany();
  console.log("Coupons:", coupons.length);
  for (const c of coupons) {
    console.log(`  - ${c.code} (${c.discountType} ${c.discountValue}%, min €${c.minOrder})`);
  }

  const reservations = await prisma.reservation.count();
  console.log("Reservations:", reservations);

  const contacts = await prisma.contact.count();
  console.log("Contacts:", contacts);

  const orders = await prisma.order.count();
  console.log("Orders:", orders);

  const giftCards = await prisma.giftCard.count();
  console.log("Gift Cards:", giftCards);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
