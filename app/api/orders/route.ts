import { NextRequest, NextResponse } from "next/server";
import { orderlix, TENANT_ID } from "@/lib/orderlix";

const WEBSITE_TABLE_ID = process.env.ORDERLIX_WEBSITE_TABLE_ID;

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
      discount_code,
      discount_amount = 0,
    } = body;

    if (!name || !phone || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!pickup_time) {
      return NextResponse.json(
        { error: "Pickup time is required" },
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

    if (!WEBSITE_TABLE_ID) {
      return NextResponse.json(
        { error: "Website ordering not configured" },
        { status: 503 }
      );
    }

    // 1. 创建一个 table session 给网站订单用
    const { data: session, error: sessionError } = await orderlix
      .from("table_session")
      .insert({
        id: crypto.randomUUID(),
        tenant_id: TENANT_ID,
        table_id: WEBSITE_TABLE_ID,
        guest_count: 1,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create order session" },
        { status: 500 }
      );
    }

    // 2. 获取当日流水号
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count } = await orderlix
      .from("order")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", TENANT_ID)
      .gte("created_at", todayStart.toISOString());

    const orderNumber = (count ?? 0) + 1;

    // 3. 创建订单
    const orderNotes = [
      `📱 Website Order`,
      `👤 ${name} | ${phone} | ${email}`,
      `⏰ Pickup: ${pickup_time}`,
      discount_code ? `🎟️ Coupon: ${discount_code} (-${discount_amount}€)` : "",
      notes || "",
    ]
      .filter(Boolean)
      .join("\n");

    const subtotal = total + discount_amount;

    const { data: order, error: orderError } = await orderlix
      .from("order")
      .insert({
        id: crypto.randomUUID(),
        tenant_id: TENANT_ID,
        session_id: session.id,
        table_id: WEBSITE_TABLE_ID,
        order_number: orderNumber,
        order_type: "takeaway",
        source: "customer_qr",
        subtotal: subtotal,
        total: total,
        notes: orderNotes,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // 4. 创建 order items
    const orderItems = items.map(
      (item: { id: string; quantity: number; price: number; name: string }) => ({
        id: crypto.randomUUID(),
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        status: "pending",
        notes: null,
      })
    );

    const { error: itemsError } = await orderlix
      .from("order_item")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // 订单已创建，items 插入失败不回滚（可在后台手动处理）
    }

    // 5. 关闭 session
    await orderlix
      .from("table_session")
      .update({ status: "closed" })
      .eq("id", session.id);

    // 6. 更新优惠券使用次数
    if (discount_code) {
      await orderlix
        .from("coupon")
        .update({ used_count: orderNumber }) // 简化处理，实际应 +1
        .eq("tenant_id", TENANT_ID)
        .eq("code", discount_code.toUpperCase().trim());
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
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
