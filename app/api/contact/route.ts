import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESTAURANT_EMAIL = "sushimaydobcnplazaeuropa@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, type, eventDetails } = body;

    if (!name || !email || !message) {
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

    const isEventInquiry = type === "event";
    const subject = isEventInquiry
      ? `[Evento] Consulta de ${name}`
      : `[Contacto] Mensaje de ${name}`;

    let htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7A4242;">${isEventInquiry ? "Consulta de evento privado" : "Nuevo mensaje de contacto"}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Nombre:</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
    `;

    if (isEventInquiry && eventDetails) {
      const fields: Array<[string, string | undefined]> = [
        ["Tipo de evento", eventDetails.eventType],
        ["Personas", eventDetails.guests],
        ["Fecha deseada", eventDetails.date],
        ["Fecha alternativa", eventDetails.dateAlt],
        ["Horario", eventDetails.eventTime],
        ["Tipo de espacio", eventDetails.venueType],
        ["Presupuesto", eventDetails.budget],
        ["Empresa / Organización", eventDetails.organization],
        ["Teléfono", eventDetails.phone],
      ];
      for (const [label, value] of fields) {
        if (value) {
          htmlBody += `
          <tr><td style="padding: 8px 0; color: #666;">${label}:</td><td style="padding: 8px 0;">${value}</td></tr>`;
        }
      }
    }

    htmlBody += `
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #FAF7F4; border-left: 3px solid #C9A87C;">
          <p style="color: #666; margin: 0 0 8px;">Mensaje:</p>
          <p style="margin: 0; white-space: pre-line;">${message}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Enviado desde sushimaydo.com
        </p>
      </div>
    `;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Sushi Maydo <noreply@sushimaydo.com>",
      to: [RESTAURANT_EMAIL],
      replyTo: email,
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
