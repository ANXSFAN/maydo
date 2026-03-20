import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      order_type = "pickup",
      delivery_address,
      delivery_fee = 0,
      discount_code,
      discount_amount = 0,
    } = body;

    if (!name || !phone || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (order_type === "pickup" && !pickup_time) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { error: "Invalid total" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        orderType: order_type,
        name,
        phone,
        email,
        pickupTime: pickup_time || null,
        notes: notes || null,
        items,
        total,
        discountCode: discount_code || null,
        discountAmount: discount_amount,
        deliveryAddress: delivery_address || undefined,
        deliveryFee: delivery_fee,
      },
      select: { id: true, orderNumber: true },
    });

    return NextResponse.json({
      success: true,
      order_number: order.orderNumber,
      order_id: order.id,
    });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
