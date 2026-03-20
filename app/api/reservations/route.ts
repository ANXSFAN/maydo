import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const reservation = await prisma.reservation.create({
      data: {
        name,
        email,
        phone,
        date: new Date(date),
        time,
        guests,
        period,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, reservation });
  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
