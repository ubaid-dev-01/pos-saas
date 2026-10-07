# Fix password reset (503 Firebase Admin)

OTP email can work with SMTP alone. **Changing the password** needs a Firebase service account key (local + Vercel `apps/pos`).

## Step 1 — Download key (one time)

1. Open https://console.firebase.google.com/project/fir-app-79c12/settings/serviceaccounts/adminsdk  
2. Click **Generate new private key** → save the `.json` (usually in Downloads)

## Step 2 — Install locally (Windows)

```powershell
cd d:\Projectes\pos\pos-saas\apps\pos
npm run firebase:setup-admin
```

When prompted, paste the full path, e.g.:

`C:\Users\YourName\Downloads\fir-app-79c12-firebase-adminsdk-xxxxx.json`

Or pass it directly:

```powershell
npm run firebase:setup-admin -- "C:\Users\YourName\Downloads\fir-app-79c12-firebase-adminsdk-xxxxx.json"
```

Then:

```powershell
npm run firebase:check-admin
```

You must see: `Firebase Admin ready`

Restart:

```powershell
npm run dev
```

## Step 3 — Vercel (POS project `pos-saas-app`)

```powershell
cd d:\Projectes\pos\pos-saas\apps\pos
npm run firebase:encode-key
```

Add to Vercel project **pos-saas-app** → Environment Variables:

- `FIREBASE_SERVICE_ACCOUNT_JSON` = one-line JSON from the script  
  **or** `FIREBASE_SERVICE_ACCOUNT_JSON_B64` = base64 line  

Redeploy POS after saving.

## Important

- Request a **new OTP** after setup (old OTP may be memory-only).
- Do **not** commit `firebase-service-account.json` (gitignored).
- Cloud Functions fallback needs Blaze; this project uses the JSON file method above.
