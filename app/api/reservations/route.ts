import { NextRequest, NextResponse } from "next/server";
import { orderlix, TENANT_ID } from "@/lib/orderlix";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, guests, period, notes } = body;

    if (!name || !email || !phone || !date || !time || !guests || !period) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    if (!["lunch", "dinner"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period" },
        { status: 400 }
      );
    }

    if (typeof guests !== "number" || guests < 1) {
      return NextResponse.json(
        { error: "Invalid guest count" },
        { status: 400 }
      );
    }

    // 写入 Orderlix 的 reservation 表
    const { data: reservation, error } = await orderlix
      .from("reservation")
      .insert({
        id: crypto.randomUUID(),
        tenant_id: TENANT_ID,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        date: date,
        time_slot: time,
        party_size: guests,
        period: period,
        notes: notes || null,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Reservation insert error:", error);
      return NextResponse.json(
        { error: "Failed to create reservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reservation });
  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
