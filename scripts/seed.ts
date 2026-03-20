import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const coupon = await prisma.coupon.upsert({
    where: { code: "OFERTAPARALLEVAR" },
    update: {},
    create: {
      code: "OFERTAPARALLEVAR",
      discountType: "percentage",
      discountValue: 20,
      minOrder: 40,
      active: true,
    },
  });
  console.log("Coupon ready:", coupon.code, `(${coupon.discountType} ${coupon.discountValue}%, min €${coupon.minOrder})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
