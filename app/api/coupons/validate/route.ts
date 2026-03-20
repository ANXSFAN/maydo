import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, order_total } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase().trim(),
        active: true,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "invalid_code" },
        { status: 200 }
      );
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, error: "max_uses_reached" },
        { status: 200 }
      );
    }

    // Check validity period
    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json(
        { valid: false, error: "not_yet_valid" },
        { status: 200 }
      );
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { valid: false, error: "expired" },
        { status: 200 }
      );
    }

    // Check minimum order
    const minOrder = coupon.minOrder ? Number(coupon.minOrder) : 0;
    if (minOrder && order_total < minOrder) {
      return NextResponse.json(
        {
          valid: false,
          error: "min_order_not_met",
          min_order: minOrder,
        },
        { status: 200 }
      );
    }

    // Calculate discount
    const discountValue = Number(coupon.discountValue ?? 0);
    let discount_amount = 0;
    if (coupon.discountType === "percentage") {
      discount_amount = (order_total * discountValue) / 100;
    } else {
      discount_amount = Math.min(discountValue, order_total);
    }

    discount_amount = Math.round(discount_amount * 100) / 100;

    return NextResponse.json({
      valid: true,
      discount_type: coupon.discountType,
      discount_value: discountValue,
      discount_amount,
      code: coupon.code,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
