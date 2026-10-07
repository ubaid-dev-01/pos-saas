# Deploy QuickPOS on Vercel

## 1. Firebase service account (required for forgot-password)

1. Open [Firebase Console](https://console.firebase.google.com) → your project (`fir-app-79c12`)
2. **Project settings** → **Service accounts** → **Generate new private key**
3. Save the file as `firebase-service-account.json` in the project root (never commit it)

**Local dev**

```bash
# After placing the JSON file in project root:
npm run firebase:check-admin
npm run dev
```

**Vercel env** (choose one):

| Variable | Value |
|----------|--------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Entire JSON on **one line** (run `npm run firebase:encode-key` to copy) |
| `FIREBASE_SERVICE_ACCOUNT_JSON_B64` | Base64 string from the same script |

Also set `FIREBASE_PROJECT_ID=fir-app-79c12` (optional if JSON includes `project_id`).

## 2. Vercel environment variables

Copy from `.env` into Vercel → **Settings** → **Environment Variables** (Production + Preview):

**Firebase (client)**

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_USE_FUNCTIONS_EMULATOR=false`

**SMTP (receipt, OTP, login thank-you, expiry alerts)**

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`
- `FROM_EMAIL`, `SMTP_FROM`, `SMTP_REPLY_TO`

**Cloudinary** (if using image upload)

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET` (and related keys)

## 3. Deploy

```bash
npm install
npm run build
npx vercel link          # first time only
npx vercel --prod
```

Or: `npm run deploy:vercel`

## 4. Firestore rules

Deploy rules so `emailOtps` stays server-only:

```bash
firebase deploy --only firestore:rules
```

## 5. Verify

- Login → thank-you email
- Forgot password → OTP email → reset password (needs Admin env on Vercel)
- POS receipt → Send Email PDF

API routes on Vercel: `/api/send-receipt-email`, `/api/send-email-otp`, `/api/verify-email-otp`, `/api/reset-password-with-otp`, etc.
