import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function checkAuth() {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_session")?.value;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table, id, status, field } = await request.json();

  try {
    switch (table) {
      case "reservation":
        await prisma.reservation.update({ where: { id }, data: { status } });
        break;
      case "order":
        await prisma.order.update({ where: { id }, data: { status } });
        break;
      case "contact":
        await prisma.contact.update({ where: { id }, data: { [field || "read"]: true } });
        break;
      case "giftCard":
        await prisma.giftCard.update({ where: { id }, data: { status } });
        break;
      case "coupon":
        await prisma.coupon.update({ where: { id }, data: { active: status === "active" } });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
