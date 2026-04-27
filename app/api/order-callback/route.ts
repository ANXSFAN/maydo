import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/order-callback
 *
 * Receives status change callbacks from Orderlix.
 * Payload: { event, orderId, deliveryOrderId, previousStatus, status, timestamp }
 *
 * deliveryOrderId = the web order id we sent as externalOrderId (e.g. M20260421-ABCD).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, deliveryOrderId, customerEmail, customerName } = body as {
      status?: string;
      deliveryOrderId?: string;
      customerEmail?: string;
      customerName?: string;
    };

    console.log(`📥 Order callback: ${deliveryOrderId} → ${status}`);

    if (status === "cancelled" && customerEmail) {
      await notifyCancellation({ email: customerEmail, name: customerName, orderId: deliveryOrderId });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Order callback error:", err);
    return NextResponse.json({ received: true });
  }
}

async function notifyCancellation(args: { email: string; name?: string; orderId?: string }) {
  if (!process.env.RESEND_API_KEY) return;
  const { email, name, orderId } = args;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Sushi Maydo <noreply@sushimaydo.es>",
      to: email,
      subject: "Su pedido ha sido cancelado — Sushi Maydo",
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #7A4242; font-weight: 400;">Pedido cancelado</h2>
          <p>Hola${name ? ` ${name}` : ""},</p>
          <p>Lamentablemente, su pedido${orderId ? ` <strong>${orderId}</strong>` : ""} ha sido cancelado por el restaurante.</p>
          <p>Como el pago se realiza en tienda al recoger, no se ha efectuado ningún cobro.</p>
          <p>Si tiene alguna duda, puede contactarnos al <a href="tel:+34936844036" style="color:#7A4242;">+34 936 844 036</a>.</p>
          <br/>
          <p>Disculpe las molestias.</p>
          <p style="color: #7A4242;">— Sushi Maydo</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Cancellation email failed:", err);
  }
}
