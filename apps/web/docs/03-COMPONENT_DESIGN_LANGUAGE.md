# QuickPOS — Component Design Language

**Companion to:** `01-VISUAL_DIRECTION.md`, `02-ART_DIRECTION.md`  
**Status:** Approved and implemented on Home + Features (Counter Truth rebuild).  
See live routes `/` and `/features`.

---

## 1. Design tokens (proposed system)

### 1.1 Spacing (8pt)

`4 · 8 · 16 · 24 · 32 · 48 · 64 · 96 · 120 · 160`

| Use | Token |
|-----|-------|
| Component internal | 8–24 |
| Stack between title/lead | 16–24 |
| Section padding Y | 96–160 |
| Grid gutter | 24–32 |

### 1.2 Color

| Token | Intent | Example direction |
|-------|--------|-------------------|
| `--canvas` | Page field | Cool paper |
| `--surface` | Panels / stages | White |
| `--ink` | Text / dark chapters | Deep blue-black |
| `--muted` | Secondary text | Mid gray |
| `--line` | Hairlines | Low-contrast rule |
| `--accent` | CTA / focus / active | Single teal or blue |
| `--accent-soft` | Focus ring wash | Tinted accent |

Semantic colors only inside product UI (success/warn/danger).

### 1.3 Radius

| Token | Value | Use |
|-------|-------|-----|
| `none` | 0 | Tables, editorial rules |
| `sm` | 4–6px | Inputs, small controls |
| `md` | 8–12px | Buttons, stage inset |
| `pill` | **Forbidden** on marketing |

### 1.4 Elevation

Prefer **border + inset background** over shadow.  
Shadows if any: `0 1px 2px` soft ambient—never multi-layer glow.

### 1.5 Type tokens

| Token | Size / weight |
|-------|----------------|
| `label` | 12 / medium / tracked |
| `body` | 16 / regular |
| `lead` | 18 / regular |
| `title` | 32–40 / medium–semibold |
| `brand` | fluid large / semibold |
| `mono` | 13–14 / medium |

One sans + one mono only.

---

## 2. Layout components

### `Shell`
Sticky header + main + footer. Canvas background. No announcement carnival.

### `Container`
Max ~1120–1200px. Horizontal padding from gutter tokens.

### `Chapter`
Full-width band. Optional `tone`: `paper` | `surface` | `ink`.  
Contains: optional eyebrow, title, lead (max 2 sentences), **one** `VisualMoment`, optional CTA row.

### `Split`
Grid 4/8 or 5/7. Copy column max-width constrained. Visual column owns the mass.

### `VisualMoment`
Wrapper for the section’s single artifact: `Stage` | `Diagram` | `Photo` | `StillLife` | `Table`.  
Caption optional (label style).

---

## 3. Brand components

### `Mark`
Geometric Q-Scan (or successor). Fixed geometry. No recolor except ink/paper inversions.

### `Lockup`
Mark + wordmark. Clear space = 0.5× mark width.

### `Nav`
Lockup | 4–5 text links | ghost Log in | solid Start free.  
Mobile: full-screen sheet, not hamburger chaos with illustrations.

---

## 4. Action components

### `Button / Primary`
Height 44–48. Ink fill. Radius md. Label 14 medium.  
Hover: slight lighten/darken—**no scale bounce**.

### `Button / Secondary`
Transparent + hairline. Ink text.

### `Button / Ghost`
Text only; underline or color shift on hover.

### `Button / WhatsApp`
Allowed as secondary channel; must not visually overpower Primary. Use restrained green only on this control—not sitewide.

### CTA group
Gap 12–16. Max two actions visible.

---

## 5. Product components (marketing)

### `Stage`
Inset canvas → white UI surface → optional chrome.  
Hosts truthful checkout / inventory / receipt / analytics compositions.  
Readable type ≥ 12px equivalent.

### `StageTabs`
Label row controlling which stage shows. Shared layout crossfade. One stage visible.

### `Diagram`
Nodes + connectors. Mono step indices. Accent on current hop.

### `Metric`
Mono number + muted label. Used in trust band or case proof. No icon.

### `Plan`
Two variants: `surface` (Starter) and `ink` (Premium). Feature list as plain lines—not checkmark fireworks.

### `DataTable`
Hairline comparison. First column labels; muted vs ink weight for contrast columns.

### `Accordion`
FAQ. Large hit area. No chevron animation circus.

### `Field`
Forms: height 44, radius sm, hairline, accent focus ring soft.

---

## 6. Feedback & overlays

### `Toast` / marketing
Rare. Prefer inline form success. If used: surface + line, no gradient.

### `WhatsApp dock`
Optional, small, corner; must not collide with primary CTA composition. Consider hide on hero first screen.

---

## 7. Icon component rules

`Icon` size 16|20, stroke 1.5, currentColor.  
Marketing pages: icons only inside `Stage` UI chrome or next to inline links—**never feature grids**.

---

## 8. Motion component rules

`Reveal`: once per chapter, respects `prefers-reduced-motion`.  
`CountUp`: metrics only.  
`DiagramSequence`: scroll or mount triggered explanation.

No global page parallax. No decorative Lottie component in the design system.

---

## 9. Content components (copy constraints baked in)

| Component | Max copy |
|-----------|----------|
| Chapter title | 1 line (2 soft wrap max) |
| Lead | 1–2 sentences |
| Stage caption | ≤ 8 words |
| Plan bullets | ≤ 5 |

If copy exceeds → edit copy, don’t shrink type into noise.

---

## 10. Page templates (language, not wireframes)

### Product Home
Hero Stage → Metrics → Problem (one visual) → System Diagram → 3–5 Capability Chapters → Proof → Pricing → FAQ/Lead → Close  

### Features
Directory jump (text) → Capability chapters with stages → Feature matrix table → Hardware still-life  

### Pricing
Plans → Compare table → Cost clarity → FAQ  

### Industries
Editorial photo chapters  

### Contact
Details + Form (form is the visual)

---

## 11. Accessibility (non-negotiable)

- Contrast AA for text  
- Focus visible (accent ring)  
- Hit targets ≥ 44px  
- Motion reducible  
- Semantic headings one H1  

Premium includes accessibility—not as afterthought.

---

## 12. Implementation gate

**Do not implement UI until:**
1. Stakeholders approve Visual Direction  
2. Stakeholders approve Art Direction  
3. Stakeholders approve this Component Design Language  

Then rebuild pages **from these specs only**—deleting the current generic section stack rather than “improving” it in place.

---

## Inspired-by map (principles → our components)

| Inspiration | Becomes in QuickPOS |
|-------------|---------------------|
| Linear spacing | 8pt tokens + Chapter Y |
| Stripe diagrams | `Diagram` component |
| Apple chapters | `Chapter` + one `VisualMoment` |
| Vercel restraint | Ink/paper, mono metrics, no ornament |
| Mercury trust | Tables, tabular numbers, quiet plans |
| Square counter | `Stage` checkout realism |
| Figma honesty | Real UI frames, not fake dashboards |
| Shopify merchant voice | Outcome copy under stages |
| Clerk clarity | Forms as first-class surfaces |
| Framer motion | Explain-only `Reveal` / sequence |

**Layouts remain original.** Principles only.
