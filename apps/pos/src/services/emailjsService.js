import emailjs from "@emailjs/browser";

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = "service_j59jk7e";
const EMAILJS_LEAD_TEMPLATE_ID = "template_1u65oxu";
const EMAILJS_SIGNUP_TEMPLATE_ID = "template_9dagbcz";

let emailJsInitialized = false;

function ensureEmailJsReady() {
  if (!EMAILJS_PUBLIC_KEY) {
    throw new Error("Missing VITE_EMAILJS_PUBLIC_KEY");
  }

  if (
    EMAILJS_PUBLIC_KEY.startsWith("service_") ||
    EMAILJS_PUBLIC_KEY.startsWith("template_")
  ) {
    throw new Error(
      "VITE_EMAILJS_PUBLIC_KEY is invalid. Use your EmailJS Public Key, not the service or template ID.",
    );
  }

  if (!emailJsInitialized) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailJsInitialized = true;
  }
}

function getOrigin() {
  return typeof window !== "undefined"
    ? window.location.origin
    : "https://quickpos.com";
}

function formatLeadDateParts(date = new Date()) {
  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function cleanPhone(phone) {
  return String(phone || "").replace(/\D+/g, "");
}

function firstInitial(name) {
  return String(name || "")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function encodedName(name) {
  return encodeURIComponent(String(name || "").trim());
}

function getLeadId(explicitLeadId) {
  if (explicitLeadId) return explicitLeadId;
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `lead_${Date.now()}`;
}

export async function sendLeadEmail(payload) {
  try {
    ensureEmailJsReady();

    const now = new Date();
    const parts = formatLeadDateParts(now);
    const leadId = getLeadId(payload.leadId);

    return await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_LEAD_TEMPLATE_ID, {
      title: payload.title || "New QuickPOS lead",
      name: payload.name || "",
      name_initial: firstInitial(payload.name),
      email: payload.email || "",
      date: parts.date,
      time: parts.time,
      phone: payload.phone || "",
      message: payload.message || "",
      business_name: payload.businessName || "",
      business_type: payload.businessType || "",
      store_count: payload.storeCount || "",
      preferred_contact: payload.preferredContact || "",
      source_page: payload.source || "",
      phone_clean: cleanPhone(payload.phone),
      name_encoded: encodedName(payload.name),
      admin_leads_url: `${getOrigin()}/super-admin`,
      lead_id: leadId,
      ip_address: "Not available on client",
    });
  } catch (error) {
    const text = String(error?.text || error?.message || "").trim();
    if (text) throw new Error(`EmailJS lead send failed: ${text}`);
    throw error;
  }
}

export async function sendSignupEmail(payload) {
  try {
    ensureEmailJsReady();

    return await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_SIGNUP_TEMPLATE_ID, {
      title: payload.title || "New signup",
      name: payload.name || "",
      date_time:
        payload.dateTime ||
        new Date().toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      business_name: payload.businessName || "",
      business_type: payload.businessType || "Store setup",
      phone: payload.phone || "",
      email: payload.email || "",
      message: payload.message || "",
      preferred_contact: payload.preferredContact || "email",
      unsubscribe_url: payload.unsubscribeUrl || getOrigin(),
      ticket_id: payload.ticketId || `SIGNUP-${Date.now()}`,
    });
  } catch (error) {
    const text = String(error?.text || error?.message || "").trim();
    if (text) throw new Error(`EmailJS signup send failed: ${text}`);
    throw error;
  }
}
