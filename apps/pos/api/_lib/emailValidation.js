/** Common disposable / fake-inbox domains — block at OTP send time. */
const DISPOSABLE = new Set(
  [
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.de",
    "sharklasers.com",
    "grr.la",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "10minutemail.com",
    "10minutemail.net",
    "yopmail.com",
    "trashmail.com",
    "discard.email",
    "discardmail.com",
    "fakeinbox.com",
    "getnada.com",
    "moakt.com",
    "throwaway.email",
    "maildrop.cc",
    "mailnesia.com",
    "emailondeck.com",
    "mintemail.com",
    "mytemp.email",
    "tmpmail.org",
    "tmpmail.net",
    "tempr.email",
  ].map((d) => d.toLowerCase()),
);

export function assertDeliverableEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    const err = new Error("Valid email is required.");
    err.code = "INVALID_EMAIL";
    throw err;
  }

  const domain = normalized.split("@").pop() || "";
  if (!domain || !domain.includes(".")) {
    const err = new Error("Valid email is required.");
    err.code = "INVALID_EMAIL";
    throw err;
  }

  if (DISPOSABLE.has(domain)) {
    const err = new Error(
      "Temporary or disposable emails are not allowed. Use a real inbox you can access.",
    );
    err.code = "DISPOSABLE_EMAIL";
    throw err;
  }

  return normalized;
}
