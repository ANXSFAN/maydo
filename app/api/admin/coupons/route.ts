import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, discountType, discountValue, minOrder, maxUses } = await request.json();

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue,
        minOrder: minOrder || null,
        maxUses: maxUses || null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
