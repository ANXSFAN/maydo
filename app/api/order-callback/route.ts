import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";

/**
 * POST /api/order-callback
 *
 * Receives status change callbacks from Orderlix.
 * Payload: { event, orderId, deliveryOrderId, previousStatus, status, timestamp }
 *
 * deliveryOrderId = Stripe checkout session ID (cs_test_xxx / cs_live_xxx)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, deliveryOrderId } = body;

    console.log(`📥 Order callback: ${deliveryOrderId} → ${status}`);

    if (status === "cancelled" && deliveryOrderId) {
      await handleCancellation(deliveryOrderId);
    }

    // Orderlix only cares about 200
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Order callback error:", err);
    return NextResponse.json({ received: true });
  }
}

async function handleCancellation(sessionId: string) {
  try {
    // 1. Get checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string;
    const email = session.customer_email || session.metadata?.email;

    if (!paymentIntentId) {
      console.error("No payment intent for session:", sessionId);
      return;
    }

    // 2. Check if already refunded
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (existingRefunds.data.length > 0) {
      console.log(`Already refunded: ${sessionId}`);
      return;
    }

    // 3. Process refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    console.log(
      `💸 Refund: ${(refund.amount / 100).toFixed(2)}€ → ${email} (${refund.id})`
    );

    // 4. Send refund notification email
    if (email && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const amount = (refund.amount / 100).toFixed(2).replace(".", ",");
      const name = session.metadata?.name || "";

      await resend.emails.send({
        from: "Sushi Maydo <noreply@sushimaydo.com>",
        to: email,
        subject: "Su pedido ha sido cancelado — Sushi Maydo",
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #7A4242; font-weight: 400;">Pedido cancelado</h2>
            <p>Hola${name ? ` ${name}` : ""},</p>
            <p>Su pedido ha sido cancelado por el restaurante. Se ha procesado un reembolso de <strong>${amount}€</strong> a su tarjeta.</p>
            <p>El reembolso puede tardar entre 5 y 10 días hábiles en aparecer en su cuenta, dependiendo de su banco.</p>
            <br/>
            <p>Disculpe las molestias.</p>
            <p style="color: #7A4242;">— Sushi Maydo</p>
          </div>
        `,
      }).catch((err) => console.error("Refund email failed:", err));
    }
  } catch (err) {
    console.error("Cancellation handling failed:", err);
  }
}
