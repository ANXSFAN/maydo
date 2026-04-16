import { NextRequest, NextResponse } from "next/server";
import { orderlix, TENANT_ID } from "@/lib/orderlix";
import { Resend } from "resend";

const RESTAURANT_EMAIL = "sushimaydobcnplazaeuropa@gmail.com";

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

    // Send confirmation email (to customer + restaurant)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const periodLabel = period === "lunch" ? "Mediodía (13:00-16:30)" : "Noche (20:30-23:30)";

        // Notify restaurant (so the staff can hold a table)
        await resend.emails.send({
          from: "Sushi Maydo <noreply@sushimaydo.com>",
          to: [RESTAURANT_EMAIL],
          replyTo: email,
          subject: `[Reserva nueva] ${name} · ${date} ${time} · ${guests}p`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7A4242; font-weight: 400;">Nueva reserva recibida</h2>
              <p style="color: #666; font-size: 13px;">Recordad reservar mesa en el POS.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #999; width: 130px;">Nombre</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Fecha</td><td style="padding: 8px 0;">${date}</td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Turno</td><td style="padding: 8px 0;">${periodLabel}</td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Hora</td><td style="padding: 8px 0;"><strong>${time}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Personas</td><td style="padding: 8px 0;"><strong>${guests}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Teléfono</td><td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #7A4242;">${phone}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #7A4242;">${email}</a></td></tr>
                ${notes ? `<tr><td style="padding: 8px 0; color: #999;">Notas</td><td style="padding: 8px 0; white-space: pre-line;">${notes}</td></tr>` : ""}
              </table>
              <p style="margin-top: 24px; font-size: 11px; color: #bbb;">Reserva ID: ${reservation?.id || "-"}</p>
            </div>
          `,
        });

        // Confirm to customer
        await resend.emails.send({
          from: "Sushi Maydo <noreply@sushimaydo.com>",
          to: [email],
          subject: "Confirmación de reserva - Sushi Maydo",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F4; padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7A4242; font-weight: 300; margin: 0;">Sushi Maydo</h1>
                <div style="width: 30px; height: 2px; background: #C9A87C; margin: 12px auto;" ></div>
              </div>
              <div style="background: white; padding: 30px; border: 1px solid #E0D5CE;">
                <h2 style="color: #7A4242; font-weight: 300; margin-top: 0;">Reserva confirmada</h2>
                <p style="color: #666; font-size: 14px;">Estimado/a ${name},</p>
                <p style="color: #666; font-size: 14px;">Hemos recibido su reserva con los siguientes datos:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; color: #999; font-size: 13px;">Fecha</td><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; font-size: 14px;">${date}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; color: #999; font-size: 13px;">Turno</td><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; font-size: 14px;">${periodLabel}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; color: #999; font-size: 13px;">Hora</td><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; font-size: 14px;">${time}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; color: #999; font-size: 13px;">Personas</td><td style="padding: 10px 0; border-bottom: 1px solid #E0D5CE; font-size: 14px;">${guests}</td></tr>
                  ${notes ? `<tr><td style="padding: 10px 0; color: #999; font-size: 13px;">Notas</td><td style="padding: 10px 0; font-size: 14px;">${notes}</td></tr>` : ""}
                </table>
                <p style="color: #666; font-size: 14px;">Si necesita modificar o cancelar su reserva, contacte con nosotros:</p>
                <p style="color: #666; font-size: 14px;">Tel: <a href="tel:+34936844036" style="color: #7A4242;">+34 936 844 036</a></p>
              </div>
              <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
                Pl. d'Europa, 102, 08902 L'Hospitalet de Llobregat, Barcelona
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Reservation email error:", emailErr);
      }
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
