import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      order_type,
      delivery_address,
      delivery_fee = 0,
      locale = "es",
    } = body;

    if (
      !name ||
      !phone ||
      !email ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!pickup_time) {
      return NextResponse.json(
        { error: "Pickup time is required" },
        { status: 400 }
      );
    }

    if (order_type === "delivery" && !delivery_address) {
      return NextResponse.json(
        { error: "Delivery address is required" },
        { status: 400 }
      );
    }

    // Build line items for Stripe
    const lineItems = items.map(
      (item: { name: string; price: number; quantity: number }) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add delivery fee as a line item
    if (order_type === "delivery" && delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Envío / Delivery" },
          unit_amount: Math.round(delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    // Build discount coupon in Stripe if applicable
    const discounts: { coupon: string }[] = [];
    if (discount_code && discount_amount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount_amount * 100),
        currency: "eur",
        duration: "once",
        name: `Descuento ${discount_code}`,
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    const origin = request.headers.get("origin") || "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: lineItems,
      discounts,
      metadata: {
        name,
        phone,
        email,
        pickup_time,
        notes: notes || "",
        order_type: order_type || "pickup",
        delivery_address: delivery_address || "",
        delivery_fee: String(delivery_fee),
        discount_code: discount_code || "",
        discount_amount: String(discount_amount),
        total: String(total),
        items_ref: items.map(
          (i: { id: string; quantity: number; price: number }) =>
            `${i.id}:${i.quantity}:${i.price}`
        ).join(","),
      },
      success_url: `${origin}/${locale}/pedido/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/pedido`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
