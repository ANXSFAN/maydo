import { Resend } from "resend";

const ORDERLIX_API_URL = process.env.ORDERLIX_API_URL!;
const ORDERLIX_TENANT_ID = process.env.ORDERLIX_TENANT_ID!;
const ORDERLIX_WEBHOOK_SECRET = process.env.ORDERLIX_WEBHOOK_SECRET;
const RESTAURANT_EMAIL = "jcy86882010@gmail.com";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const RESTAURANT_SMS_TO = process.env.RESTAURANT_SMS_TO;

export type OrderItemSetMealSelection = {
  courseNumber: number;
  name: string;
  priceDelta: number;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: { choice: string; priceModifier: number }[];
  /** 套餐行标识 */
  isSetMeal?: boolean;
  /** 套餐的课程选择（仅套餐行） */
  selections?: OrderItemSetMealSelection[];
};

export type WebOrder = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  pickupTime: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  discountCode: string | null;
  discountAmount: number;
  locale: string;
  origin: string;
};

export type FulfillResult = {
  status: "fulfilled" | "partial";
  orderlixOrderId?: string;
};

export async function fulfillWebOrder(order: WebOrder): Promise<FulfillResult> {
  const orderlixOrderId = await pushToOrderlix(order);

  // Notifications are fire-and-forget — a notification failure must not block order confirmation.
  notifyRestaurantEmail(order).catch((err) => console.error("Restaurant email failed:", err));
  notifyRestaurantSms(order).catch((err) => console.error("Restaurant SMS failed:", err));
  notifyCustomerEmail(order).catch((err) => console.error("Customer email failed:", err));

  return {
    status: orderlixOrderId ? "fulfilled" : "partial",
    orderlixOrderId,
  };
}

async function pushToOrderlix(order: WebOrder): Promise<string | undefined> {
  const notes = [
    "Recogida en tienda · Pago en tienda",
    `Cliente: ${order.name} | ${order.phone}`,
    `Hora: ${order.pickupTime}`,
    order.notes || "",
  ].filter(Boolean).join("\n");

  const payload = {
    tenantId: ORDERLIX_TENANT_ID,
    platform: "website",
    externalOrderId: order.orderId,
    totalAmount: order.total,
    callbackUrl: `${order.origin}/api/order-callback`,
    customerName: order.name,
    customerPhone: order.phone,
    notes,
    items: order.items.map((i) => ({
      menuItemId: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
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
    console.log(`✅ Order pushed to Orderlix (${data.orderId}), orderId: ${order.orderId}`);
    return data.orderId;
  } catch (err) {
    console.error("Orderlix push exception:", err);
    return undefined;
  }
}

const fmt = (n: number) => n.toFixed(2).replace(".", ",") + "€";

function renderItemDetailHtml(i: OrderItem): string {
  if (i.isSetMeal && i.selections?.length) {
    // 按 name+priceDelta 聚合，同一道菜选多份显示 "名字 × N"
    const grouped: { name: string; priceDelta: number; count: number }[] = [];
    for (const s of i.selections) {
      const existing = grouped.find(
        (g) => g.name === s.name && g.priceDelta === s.priceDelta
      );
      if (existing) existing.count += 1;
      else grouped.push({ name: s.name, priceDelta: s.priceDelta, count: 1 });
    }
    const lines = grouped
      .map(({ name, priceDelta, count }) => {
        const qty = count > 1 ? ` × ${count}` : "";
        const extra = priceDelta > 0 ? ` (+${fmt(priceDelta * count)})` : "";
        return `&nbsp;&nbsp;· ${escapeHtml(name)}${qty}${extra}`;
      })
      .join("<br/>");
    return `<div style="font-size:11px;color:#999;margin-top:3px;line-height:1.5;">${lines}</div>`;
  }
  if (i.options?.length) {
    return `<div style="font-size:11px;color:#999;">${escapeHtml(i.options.map((o) => o.choice).join(" · "))}</div>`;
  }
  return "";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notifyRestaurantEmail(order: WebOrder) {
  if (!process.env.RESEND_API_KEY) return;

  const itemsHtml = order.items
    .map((i) => {
      const prefix = i.isSetMeal ? "📋 " : "";
      return `
        <tr>
          <td style="padding:6px 0;">${prefix}${escapeHtml(i.name)} × ${i.quantity}${renderItemDetailHtml(i)}</td>
          <td style="padding:6px 0; text-align:right;">${fmt(i.price * i.quantity)}</td>
        </tr>`;
    })
    .join("");

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Sushi Maydo <noreply@sushimaydo.es>",
    to: [RESTAURANT_EMAIL],
    replyTo: order.email || undefined,
    subject: `[Pedido nuevo] ${order.name} · Recogida ${order.pickupTime} · ${fmt(order.total)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7A4242; font-weight: 400;">Nuevo pedido para recoger</h2>
        <p style="color: #b8860b; font-size: 13px; font-weight: 600;">💰 Pago en tienda al recoger.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px 0; color: #999; width: 130px;">Pedido</td><td style="padding: 8px 0;"><strong>${order.orderId}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Cliente</td><td style="padding: 8px 0;"><strong>${order.name}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Hora recogida</td><td style="padding: 8px 0;"><strong>${order.pickupTime}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Teléfono</td><td style="padding: 8px 0;"><a href="tel:${order.phone}" style="color: #7A4242;">${order.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${order.email}" style="color: #7A4242;">${order.email}</a></td></tr>
          ${order.notes ? `<tr><td style="padding: 8px 0; color: #999;">Notas</td><td style="padding: 8px 0; white-space: pre-line;">${order.notes}</td></tr>` : ""}
        </table>
        <h3 style="color: #7A4242; font-weight: 400; margin-top: 24px; border-bottom: 1px solid #E0D5CE; padding-bottom: 8px;">Platos</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          ${order.discountAmount > 0 ? `<tr><td style="padding:6px 0; color:#999;">Descuento${order.discountCode ? ` (${order.discountCode})` : ""}</td><td style="padding:6px 0; text-align:right; color:#1a7f37;">-${fmt(order.discountAmount)}</td></tr>` : ""}
          <tr><td style="padding:10px 0; border-top: 2px solid #C9A87C; font-weight: 600;">Total a cobrar</td><td style="padding:10px 0; border-top: 2px solid #C9A87C; text-align:right; font-weight: 600; color:#7A4242;">${fmt(order.total)}</td></tr>
        </table>
      </div>
    `,
  });
}

async function notifyRestaurantSms(order: WebOrder) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !RESTAURANT_SMS_TO) return;

  const body = [
    `Nuevo pedido Maydo: ${order.name}`,
    `Recogida ${order.pickupTime} · ${fmt(order.total)} (pago en tienda)`,
    `Tel: ${order.phone}`,
    `${order.items.reduce((s, i) => s + i.quantity, 0)} platos · Ref ${order.orderId}`,
  ].join("\n");

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: RESTAURANT_SMS_TO,
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }).toString(),
    }
  );
  if (!res.ok) {
    console.error("Twilio SMS error:", res.status, await res.text());
  }
}

async function notifyCustomerEmail(order: WebOrder) {
  if (!process.env.RESEND_API_KEY) return;

  const tr = customerCopy(order.locale);

  const itemsHtml = order.items
    .map((i) => {
      return `
        <tr>
          <td style="padding:6px 0;">${escapeHtml(i.name)} × ${i.quantity}${renderItemDetailHtml(i)}</td>
          <td style="padding:6px 0; text-align:right;">${fmt(i.price * i.quantity)}</td>
        </tr>`;
    })
    .join("");

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Sushi Maydo <noreply@sushimaydo.es>",
    to: [order.email],
    replyTo: RESTAURANT_EMAIL,
    subject: tr.subject(order.orderId),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7A4242; font-weight: 400;">${tr.greeting(order.name)}</h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">${tr.intro}</p>
        <div style="background: #FFF8F0; border: 1px solid #E0D5CE; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #7A4242;"><strong>${tr.payAtStore}</strong></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 6px 0; color: #999; width: 130px;">${tr.orderLabel}</td><td style="padding: 6px 0;"><strong>${order.orderId}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #999;">${tr.pickupLabel}</td><td style="padding: 6px 0;"><strong>${order.pickupTime}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #999;">${tr.addressLabel}</td><td style="padding: 6px 0;">Carrer Santa Eulàlia, 204<br/>08902 L'Hospitalet de Llobregat</td></tr>
        </table>
        <h3 style="color: #7A4242; font-weight: 400; margin-top: 24px; border-bottom: 1px solid #E0D5CE; padding-bottom: 8px;">${tr.itemsHeader}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          ${order.discountAmount > 0 ? `<tr><td style="padding:6px 0; color:#999;">${tr.discountLabel}${order.discountCode ? ` (${order.discountCode})` : ""}</td><td style="padding:6px 0; text-align:right; color:#1a7f37;">-${fmt(order.discountAmount)}</td></tr>` : ""}
          <tr><td style="padding:10px 0; border-top: 2px solid #C9A87C; font-weight: 600;">Total</td><td style="padding:10px 0; border-top: 2px solid #C9A87C; text-align:right; font-weight: 600; color:#7A4242;">${fmt(order.total)}</td></tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 32px; line-height: 1.6;">${tr.footer}</p>
      </div>
    `,
  });
}

function customerCopy(locale: string) {
  switch (locale) {
    case "en":
      return {
        subject: (id: string) => `Your Sushi Maydo order #${id} is confirmed`,
        greeting: (name: string) => `Hi ${name}, thanks for your order!`,
        intro: "We've received your order. Please come to the restaurant at your chosen pickup time.",
        payAtStore: "💰 Payment is made at the restaurant when you pick up.",
        orderLabel: "Order",
        pickupLabel: "Pickup time",
        addressLabel: "Address",
        itemsHeader: "Your items",
        discountLabel: "Discount",
        footer: "See you soon! If you need to cancel or change the order, please call +34 665 128 006.",
      };
    case "ca":
      return {
        subject: (id: string) => `La teva comanda Sushi Maydo #${id} està confirmada`,
        greeting: (name: string) => `Hola ${name}, gràcies per la teva comanda!`,
        intro: "Hem rebut la teva comanda. Passa pel restaurant a l'hora de recollida escollida.",
        payAtStore: "💰 El pagament es fa al restaurant en recollir.",
        orderLabel: "Comanda",
        pickupLabel: "Hora recollida",
        addressLabel: "Adreça",
        itemsHeader: "La teva comanda",
        discountLabel: "Descompte",
        footer: "A reveure! Si has d'anul·lar o canviar la comanda, truca'ns al +34 665 128 006.",
      };
    case "zh":
      return {
        subject: (id: string) => `您的 Sushi Maydo 订单 #${id} 已确认`,
        greeting: (name: string) => `您好 ${name}，感谢您的订单！`,
        intro: "我们已收到您的订单，请在选定的取餐时间到餐厅取餐。",
        payAtStore: "💰 取餐时在店内付款。",
        orderLabel: "订单号",
        pickupLabel: "取餐时间",
        addressLabel: "地址",
        itemsHeader: "您的订单",
        discountLabel: "优惠",
        footer: "期待您的光临！如需取消或修改订单，请致电 +34 665 128 006。",
      };
    default:
      return {
        subject: (id: string) => `Tu pedido Sushi Maydo #${id} está confirmado`,
        greeting: (name: string) => `Hola ${name}, ¡gracias por tu pedido!`,
        intro: "Hemos recibido tu pedido. Pásate por el restaurante a la hora de recogida elegida.",
        payAtStore: "💰 El pago se realiza en el restaurante al recoger.",
        orderLabel: "Pedido",
        pickupLabel: "Hora recogida",
        addressLabel: "Dirección",
        itemsHeader: "Tu pedido",
        discountLabel: "Descuento",
        footer: "¡Nos vemos! Si necesitas anular o cambiar el pedido, llámanos al +34 665 128 006.",
      };
  }
}
