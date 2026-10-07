# QuickPOS Brand Assets

## 📁 Files Included

### Logos

| File             | Size    | Use Case                                         |
| ---------------- | ------- | ------------------------------------------------ |
| `logo-full.svg`  | Vector  | Primary logo (dark bg text) website header, docs |
| `logo-full.png`  | 640×160 | When SVG not supported                           |
| `logo-white.svg` | Vector  | For dark backgrounds footer, dark hero sections  |
| `logo-white.png` | 640×160 | When SVG not supported                           |

### Favicons

| File                  | Size    | Use Case                              |
| --------------------- | ------- | ------------------------------------- |
| `favicon-minimal.svg` | Vector  | Browser tab favicon (modern browsers) |
| `favicon.svg`         | Vector  | Detailed app icon                     |
| `favicon-512.png`     | 512×512 | PWA icon, app store                   |
| `favicon-192.png`     | 192×192 | Android Chrome, PWA manifest          |
| `favicon-32.png`      | 32×32   | Classic browser tab favicon           |

### OG / Social Media

| File              | Size      | Use Case                           |
| ----------------- | --------- | ---------------------------------- |
| `og-image.svg`    | Vector    | Source file for edits              |
| `og-image.png`    | 1200×630  | Facebook, LinkedIn, WhatsApp share |
| `og-image-2x.png` | 2400×1260 | Retina/HiDPI social shares         |

---

## 🔧 How to Use in Your Project

### index.html Add these meta tags:

```html
<head>
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png" />

  <!-- OG Image for Social Sharing -->
  <meta
    property="og:image"
    content="https://pos-saas-kappa.vercel.app/og-image.png"
  />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta
    property="og:title"
    content="QuickPOS   The Smartest POS for Modern Retail"
  />
  <meta
    property="og:description"
    content="Run your store, track inventory, serve customers   all from one powerful platform. Start free."
  />
  <meta property="og:url" content="https://pos-saas-kappa.vercel.app" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:image"
    content="https://pos-saas-kappa.vercel.app/og-image.png"
  />
  <meta
    name="twitter:title"
    content="QuickPOS   The Smartest POS for Modern Retail"
  />
  <meta
    name="twitter:description"
    content="Cloud-based SaaS POS system. Inventory, customers, reports, multi-user. Free to start."
  />
</head>
```

### File Placement in Vercel Project:

```
public/
├── favicon.svg          ← Copy favicon-minimal.svg
├── favicon-32.png       ← Copy favicon-32.png
├── favicon-192.png      ← Copy favicon-192.png
├── favicon-512.png      ← Copy favicon-512.png
├── og-image.png         ← Copy og-image.png
├── logo-full.svg        ← Copy logo-full.svg
├── logo-full.png        ← Copy logo-full.png
├── logo-white.svg       ← Copy logo-white.svg
└── logo-white.png       ← Copy logo-white.png
```

---

## 🎨 Brand Colors

| Name                  | Hex       | Usage                             |
| --------------------- | --------- | --------------------------------- |
| Primary (Deep Teal)   | `#0D3B39` | Sidebar, headers, primary buttons |
| Secondary (Warm Gold) | `#E8A735` | Accents, highlights, CTA          |
| Accent (Mint Teal)    | `#2A9D8F` | Success, links, charts            |
| Background            | `#F7F9FC` | Page background                   |
| Surface               | `#FFFFFF` | Cards, modals                     |
| Error                 | `#E76F51` | Errors, danger                    |
| Text Primary          | `#1A1A1A` | Main text                         |
| Text Muted            | `#6B7280` | Secondary text                    |
