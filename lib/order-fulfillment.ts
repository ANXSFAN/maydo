import type Stripe from "stripe";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";

const ORDERLIX_API_URL = process.env.ORDERLIX_API_URL!;
const ORDERLIX_TENANT_ID = process.env.ORDERLIX_TENANT_ID!;
const ORDERLIX_WEBHOOK_SECRET = process.env.ORDERLIX_WEBHOOK_SECRET;
const RESTAURANT_EMAIL = "sushimaydobcnplazaeuropa@gmail.com";

// In-memory dedupe — Stripe webhook and the success page may both trigger fulfillment
// for the same session. Hot lambda instance only; Orderlix's own externalOrderId
// idempotency is the durable safety net.
const fulfilledSessions = new Map<string, number>();
const FULFILL_DEDUPE_MS = 30 * 60 * 1000;

export type FulfillResult = {
  status: "fulfilled" | "already_done" | "not_paid";
  orderId?: string;
};

export async function fulfillCheckoutSession(
  sessionId: string,
  origin: string
): Promise<FulfillResult> {
  const now = Date.now();
  for (const [k, v] of fulfilledSessions) {
    if (now - v > FULFILL_DEDUPE_MS) fulfilledSessions.delete(k);
  }
  if (fulfilledSessions.has(sessionId)) {
    return { status: "already_done" };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  if (session.status !== "complete") {
    return { status: "not_paid" };
  }

  // Mark as fulfilled before doing the work — second invocation must not re-run.
  fulfilledSessions.set(sessionId, now);

  const meta = session.metadata ?? {};
  const isDelivery = meta.order_type === "delivery";
  const deliveryFee = parseFloat(meta.delivery_fee || "0") || 0;
  const discountAmount = parseFloat(meta.discount_amount || "0") || 0;
  const total = parseFloat(meta.total || "0") || 0;

  const lineItems = session.line_items?.data || [];
  const refs = (meta.items_ref || "").split(",").filter(Boolean);
  const items = refs.map((ref, i) => {
    const [menuItemId, qty, price] = ref.split(":");
    return {
      menuItemId,
      name: lineItems[i]?.description || "",
      quantity: parseInt(qty) || 1,
      unitPrice: parseFloat(price) || 0,
    };
  });

  const orderId = await pushToOrderlix({ sessionId, meta, isDelivery, items, total, origin });

  // Fire and forget — email failure must not block the rest of the flow.
  notifyRestaurantNewOrder({
    sessionId,
    meta,
    isDelivery,
    items,
    deliveryFee,
    discountAmount,
    total,
  }).catch((err) => console.error("Restaurant notification failed:", err));

  return { status: "fulfilled", orderId };
}

async function pushToOrderlix(args: {
  sessionId: string;
  meta: Stripe.Metadata;
  isDelivery: boolean;
  items: Array<{ menuItemId: string; name: string; quantity: number; unitPrice: number }>;
  total: number;
  origin: string;
}): Promise<string | undefined> {
  const { sessionId, meta, isDelivery, items, total, origin } = args;

  const notes = [
    isDelivery ? "Entrega a domicilio" : "Recogida en tienda",
    `Cliente: ${meta.name} | ${meta.phone}`,
    `Hora: ${meta.pickup_time}`,
    isDelivery && meta.delivery_address ? `Direccion: ${meta.delivery_address}` : "",
    meta.notes || "",
  ].filter(Boolean).join("\n");

  const payload = {
    tenantId: ORDERLIX_TENANT_ID,
    platform: "website",
    externalOrderId: sessionId,
    totalAmount: total,
    callbackUrl: `${origin}/api/order-callback`,
    customerName: meta.name,
    customerPhone: meta.phone,
    deliveryAddress: isDelivery ? meta.delivery_address : undefined,
    notes,
    items,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (ORDERLIX_WEBHOOK_SECRET) {
    const { createHmac } = await import("crypto");
    const signature = createHmac("sha256", ORDERLIX_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");
    headers["x-webhook-signature"] = signature;
  }

  try {
    const res = await fetch(
      `${ORDERLIX_API_URL}/api/webhooks/delivery?platform=website`,
      { method: "POST", headers, body: JSON.stringify(payload) }
    );
    if (!res.ok) {
      console.error("Orderlix webhook error:", res.status, await res.text());
      return undefined;
    }
    const data = await res.json();
    console.log(`✅ Order pushed to Orderlix (${data.orderId}), session: ${sessionId}`);
    return data.orderId;
  } catch (err) {
    console.error("Orderlix push exception:", err);
    return undefined;
  }
}

type NotifyArgs = {
  sessionId: string;
  meta: Stripe.Metadata;
  isDelivery: boolean;
  items: Array<{ menuItemId: string; name: string; quantity: number; unitPrice: number }>;
  deliveryFee: number;
  discountAmount: number;
  total: number;
};

async function notifyRestaurantNewOrder(args: NotifyArgs) {
  if (!process.env.RESEND_API_KEY) return;
  const { sessionId, meta, isDelivery, items, deliveryFee, discountAmount, total } = args;

  const fmt = (n: number) => n.toFixed(2).replace(".", ",") + "€";

  const itemsHtml = items
    .map(
      (i) => `
        <tr>
          <td style="padding:6px 0;">${i.name} × ${i.quantity}</td>
          <td style="padding:6px 0; text-align:right;">${fmt(i.unitPrice * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Sushi Maydo <noreply@sushimaydo.com>",
    to: [RESTAURANT_EMAIL],
    replyTo: meta.email || undefined,
    subject: `[Pedido nuevo] ${meta.name} · ${isDelivery ? "Delivery" : "Recogida"} ${meta.pickup_time} · ${fmt(total)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7A4242; font-weight: 400;">Nuevo pedido pagado</h2>
        <p style="color: #666; font-size: 13px;">Recordad preparar el pedido en el POS.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px 0; color: #999; width: 130px;">Cliente</td><td style="padding: 8px 0;"><strong>${meta.name}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Tipo</td><td style="padding: 8px 0;"><strong>${isDelivery ? "Entrega a domicilio" : "Recoger en tienda"}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Hora</td><td style="padding: 8px 0;"><strong>${meta.pickup_time}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Teléfono</td><td style="padding: 8px 0;"><a href="tel:${meta.phone}" style="color: #7A4242;">${meta.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${meta.email}" style="color: #7A4242;">${meta.email}</a></td></tr>
          ${isDelivery && meta.delivery_address ? `<tr><td style="padding: 8px 0; color: #999;">Dirección</td><td style="padding: 8px 0; white-space: pre-line;">${meta.delivery_address}</td></tr>` : ""}
          ${meta.notes ? `<tr><td style="padding: 8px 0; color: #999;">Notas</td><td style="padding: 8px 0; white-space: pre-line;">${meta.notes}</td></tr>` : ""}
        </table>
        <h3 style="color: #7A4242; font-weight: 400; margin-top: 24px; border-bottom: 1px solid #E0D5CE; padding-bottom: 8px;">Platos</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          ${deliveryFee > 0 ? `<tr><td style="padding:6px 0; color:#999;">Envío</td><td style="padding:6px 0; text-align:right;">${fmt(deliveryFee)}</td></tr>` : ""}
          ${discountAmount > 0 ? `<tr><td style="padding:6px 0; color:#999;">Descuento${meta.discount_code ? ` (${meta.discount_code})` : ""}</td><td style="padding:6px 0; text-align:right; color:#1a7f37;">-${fmt(discountAmount)}</td></tr>` : ""}
          <tr><td style="padding:10px 0; border-top: 2px solid #C9A87C; font-weight: 600;">Total</td><td style="padding:10px 0; border-top: 2px solid #C9A87C; text-align:right; font-weight: 600; color:#7A4242;">${fmt(total)}</td></tr>
        </table>
        <p style="margin-top: 24px; font-size: 11px; color: #bbb;">Stripe session: ${sessionId}</p>
      </div>
    `,
  });
}
