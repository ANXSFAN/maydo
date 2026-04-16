import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/order-fulfillment";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete") {
      return NextResponse.json({ status: session.status });
    }

    // Fallback fulfillment in case the Stripe webhook hasn't arrived yet.
    // dedupe inside fulfillCheckoutSession means it's safe to call repeatedly.
    const origin = request.headers.get("origin")
      || request.headers.get("referer")?.replace(/\/[^/]*$/, "")
      || process.env.NEXT_PUBLIC_SITE_URL
      || "https://sushimaydo.com";

    fulfillCheckoutSession(sessionId, origin).catch((err) =>
      console.error("Fulfillment from status route failed:", err)
    );

    const meta = session.metadata ?? {};
    return NextResponse.json({
      status: "complete",
      metadata: {
        name: meta.name,
        pickup_time: meta.pickup_time,
        order_type: meta.order_type,
        total: meta.total,
      },
    });
  } catch (err) {
    console.error("Checkout status error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
