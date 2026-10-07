function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha1Hex(text) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Browser does not support crypto.subtle for Cloudinary signature",
    );
  }
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-1", data);
  return toHex(digest);
}

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || "";
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET || "";

  if (!cloudName) {
    throw new Error("Missing VITE_CLOUDINARY_CLOUD_NAME");
  }

  return { cloudName, uploadPreset, apiKey, apiSecret };
}

export async function uploadImageToCloudinary(file, options = {}) {
  const { cloudName, uploadPreset, apiKey, apiSecret } = getCloudinaryConfig();
  const folder = options.folder || "quickpos";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  if (uploadPreset) {
    form.append("upload_preset", uploadPreset);
  } else if (apiKey && apiSecret) {
    // Fallback for setups without unsigned preset. Prefer unsigned preset in production.
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1Hex(signaturePayload);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
  } else {
    throw new Error(
      "Cloudinary config missing: set VITE_CLOUDINARY_UPLOAD_PRESET or API key/secret",
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message = payload?.error?.message || "Cloudinary upload failed";
    throw new Error(message);
  }

  return payload?.secure_url || payload?.url || "";
}
