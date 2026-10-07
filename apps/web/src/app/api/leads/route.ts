import { NextResponse } from "next/server";
import { sendLeadNotification, sendLeadThankYou } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const businessName = String(body?.businessName || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();
    const source = String(body?.source || "website").trim();

    if (!name || !businessName || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const normalizedPhone = phone.startsWith("+") ? phone : `+92 ${phone}`;

    const lead = {
      name,
      businessName,
      phone: normalizedPhone,
      email: email || undefined,
      message: message || undefined,
      source,
    };

    await sendLeadNotification(lead);
    await sendLeadThankYou(lead).catch((err) => {
      console.error("[lead thank-you]", err);
    });

    // Optional: forward to POS lead API / Firestore bridge when configured
    const posApi = process.env.POS_LEAD_API_URL;
    if (posApi) {
      await fetch(posApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          businessName,
          phone: normalizedPhone,
          email: email || null,
          message,
          source,
          status: "new",
          createdAt: new Date().toISOString(),
        }),
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[lead]", error);
    const msg =
      error instanceof Error ? error.message : "Could not send lead email";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
