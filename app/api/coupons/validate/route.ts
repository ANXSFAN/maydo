import { NextRequest, NextResponse } from "next/server";
import { orderlix, TENANT_ID } from "@/lib/orderlix";

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

    // 查 Orderlix 的 coupon 表
    const { data: coupon, error } = await orderlix
      .from("coupon")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: "invalid_code" },
        { status: 200 }
      );
    }

    // 检查使用次数
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, error: "max_uses_reached" },
        { status: 200 }
      );
    }

    // 检查有效期
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { valid: false, error: "not_yet_valid" },
        { status: 200 }
      );
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return NextResponse.json(
        { valid: false, error: "expired" },
        { status: 200 }
      );
    }

    // 检查最低消费
    const minOrder = coupon.min_order ? Number(coupon.min_order) : 0;
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

    // 计算折扣
    const discountValue = Number(coupon.value ?? 0);
    let discount_amount = 0;
    if (coupon.type === "percentage") {
      discount_amount = (order_total * discountValue) / 100;
    } else {
      discount_amount = Math.min(discountValue, order_total);
    }
    discount_amount = Math.round(discount_amount * 100) / 100;

    return NextResponse.json({
      valid: true,
      discount_type: coupon.type,
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
