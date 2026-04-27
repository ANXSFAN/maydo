import { NextRequest, NextResponse } from "next/server";
import { fulfillWebOrder, type OrderItem } from "@/lib/order-fulfillment";

type Incoming = {
  name: string;
  phone: string;
  email: string;
  pickup_time: string;
  notes?: string | null;
  items: OrderItem[];
  total: number;
  discount_code?: string | null;
  discount_amount?: number;
  locale?: string;
};

const newOrderId = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `M${date}-${rand}`;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Incoming;
    const {
      name,
      phone,
      email,
      pickup_time,
      notes,
      items,
      total,
      discount_code,
      discount_amount = 0,
      locale = "es",
    } = body;

    if (
      !name ||
      !phone ||
      !email ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !pickup_time
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin")
      || request.headers.get("referer")?.replace(/\/[^/]*$/, "")
      || process.env.NEXT_PUBLIC_SITE_URL
      || "https://sushimaydo.es";

    const orderId = newOrderId();

    const result = await fulfillWebOrder({
      orderId,
      name,
      phone,
      email,
      pickupTime: pickup_time,
      notes: notes ?? null,
      items,
      total,
      discountCode: discount_code ?? null,
      discountAmount: discount_amount,
      locale,
      origin,
    });

    return NextResponse.json({
      orderId,
      orderlixOrderId: result.orderlixOrderId,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
