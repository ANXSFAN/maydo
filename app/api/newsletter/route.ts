import { NextRequest, NextResponse } from "next/server";
import { orderlix, TENANT_ID } from "@/lib/orderlix";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Check if already subscribed
    const { data: existing } = await orderlix
      .from("newsletter_subscriber")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      // Already subscribed — return success silently
      return NextResponse.json({ success: true });
    }

    // Insert new subscriber
    const { error } = await orderlix
      .from("newsletter_subscriber")
      .insert({
        id: crypto.randomUUID(),
        tenant_id: TENANT_ID,
        email,
        locale: locale || "es",
        subscribed_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Newsletter insert error:", error);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
