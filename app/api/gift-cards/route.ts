import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MAYDO-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      sender_name,
      sender_email,
      recipient_name,
      recipient_email,
      message,
      send_date,
    } = body;

    if (!amount || !sender_name || !sender_email || !recipient_name || !recipient_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email) || !emailRegex.test(recipient_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount < 10 || amount > 500) {
      return NextResponse.json(
        { error: "Amount must be between 10 and 500" },
        { status: 400 }
      );
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        code: generateCode(),
        amount,
        balance: amount,
        senderName: sender_name,
        senderEmail: sender_email,
        recipientName: recipient_name,
        recipientEmail: recipient_email,
        message: message || null,
        sendDate: send_date ? new Date(send_date) : null,
      },
      select: { id: true, code: true },
    });

    return NextResponse.json({
      success: true,
      code: giftCard.code,
      id: giftCard.id,
    });
  } catch (err) {
    console.error("Gift card error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
