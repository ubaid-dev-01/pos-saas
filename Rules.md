# Rules.md — AI Development Rules & Skills (All-in-One)

> **Version:** 2.3.1 · **Updated:** 2026-07-23  
> **Repository:** https://github.com/aftab-ahmad-khan-dev/ai-dev-guardrails
> 
> Single-file **rules + skills** reference for Cursor, Claude, Copilot, Codex, Gemini, and any agent.
> **Install this pack:** `npx skills add aftab-ahmad-khan-dev/ai-dev-guardrails` — see [README.md](README.md).
> **Project detail & tasks live in [`SRS.md`](SRS.md)** — read it first; update status after each done task.
> **Lifecycle skills** (25 × `SKILL.md`): [`skills/`](skills/) — entrypoint [`ai-dev-guardrails`](skills/ai-dev-guardrails/SKILL.md).
> For **applicability matrix**, **lifecycle map**, and **compliance report**, see [README.md](README.md).

## Table of Contents

0. [Rules, Skills & SRS Workflow](#0-rules-skills--srs-workflow)
1. [Client-Side Rules](#1-client-side-rules)
2. [Server-Side Rules](#2-server-side-rules)
3. [Variable & Naming Conventions](#3-variable--naming-conventions)
4. [Security Rules](#4-security-rules)
5. [DevOps Rules](#5-devops-rules)
6. [Security Scan Checklist](#6-security-scan-checklist)

---
## 0. Rules, Skills & SRS Workflow

This pack is both **rules** (what good code must satisfy) and **skills** (how the AI must operate on a project). It installs as Agent Skills for any AI tool.

| Kind | Role |
|------|------|
| **Rules** | CS-*, SS-*, naming, SEC-*, OPS-*, scans — quality, security, and delivery standards |
| **SRS skills** | Board workflow: read SRS → pick task → implement under rules → mark complete → report |
| **Lifecycle skills** | Engineering workflows in [`skills/`](skills/) (25): `/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship` |
| **Meta skill** | [`ai-dev-guardrails`](skills/ai-dev-guardrails/SKILL.md) — entrypoint that wires SRS + Rules + lifecycle |

### Install (any AI)

```bash
npx skills add aftab-ahmad-khan-dev/ai-dev-guardrails
npx skills add aftab-ahmad-khan-dev/ai-dev-guardrails --skill ai-dev-guardrails
```

Keep `SRS.md` + this file (or YAML packs) at the project root. Guides: [`docs/getting-started.md`](docs/getting-started.md).

### Skill SRS-01 — Always read `SRS.md` first

> **Severity:** `critical` · **Status:** `complete`

**Summary:** All project description, scope, and tasks live in [`SRS.md`](SRS.md). Do not invent product goals or task lists from chat alone when `SRS.md` exists.

**Rules**
- Before planning, coding, or reviewing: **open and read `SRS.md`**.
- Treat § Project description as source of truth for what the product is.
- Work from the **task board** (version sections and/or dated backlog) — prefer current-version open tasks.
- If `SRS.md` is missing in a consuming project, create it from this repo’s template and ask the human to confirm description + first tasks before large implementation.

**Do**
- State which task ID(s) you are executing (e.g. `T-002`) at the start of work.
- Set that task to `in_progress` in `SRS.md` when you begin (one primary task unless asked to parallelize).
- After the task is done: set status to `done`, fill **Completed** (ISO date), add a short **Notes** line, bump **Last updated**.
- Extend the board when scope grows: new rows under the right **version**, and/or a new **dated** section — never silently drop history (use `cancelled` + reason).
- When a version ships, update the version roadmap status and SRS change log.

**Don't**
- Skip `SRS.md` and implement from memory or a vague chat request when the board exists.
- Mark `done` without updating `SRS.md`.
- Delete completed tasks; keep them as history.
- Expand scope into new features without adding tasks to `SRS.md` (or getting human approval first).

**AI directive:** Read `SRS.md` first. Execute open tasks under applicable CS/SS/SEC/OPS rules **and** matching lifecycle skills. On every completion, update `SRS.md` status (and version/date sections as needed). Emit the compliance report from the README when the slice is reviewable.

### Skill SRS-02 — Version- and date-wise task extension

> **Severity:** `high` · **Status:** `complete`

**Summary:** Tasks may grow over time. Organize new work by **version** (`0.1.0`, `0.2.0`, …) and/or by **date** sections in `SRS.md`.

**Rules**
- New planned work → add under the target version table (create the version section if needed).
- Time-boxed / one-off work → add under an Ad-hoc / dated backlog day section.
- Keep IDs unique (`T-###` for version tasks, `D-###` for dated tasks).
- Sync **Current version** and roadmap table when starting a new version.

**AI directive:** When the human adds scope (“also do X in v0.2” / “by Friday”), extend `SRS.md` with the new task row(s) under the correct version or date, then execute from that board.

### Skill LIFECYCLE-01 — Use matching lifecycle skills from `skills/`

> **Severity:** `high` · **Status:** `complete`

**Summary:** When work matches a lifecycle skill (spec, plan, TDD, review, security, ship, …), follow that skill’s process in [`skills/<name>/SKILL.md`](skills/). Do not invent a weaker ad-hoc process.

**Rules**
- Pack entrypoint → [`skills/ai-dev-guardrails`](skills/ai-dev-guardrails/SKILL.md).
- Unsure which skill applies → [`skills/using-agent-skills`](skills/using-agent-skills/SKILL.md).
- New/underspecified work → `interview-me` / `idea-refine` / `spec-driven-development` before large coding.
- Implementation → prefer `incremental-implementation` + `test-driven-development`.
- UI → `frontend-ui-engineering`; API/boundaries → `api-and-interface-design`.
- Before merge → `code-review-and-quality` (and `security-and-hardening` when auth/input/data are involved).
- Still enforce applicable CS/SS/SEC/OPS rules; lifecycle skills do not replace the compliance report.
- Do **not** load all 25 skills into context at once — only the phase that matches the current task.

**Lifecycle map (quick)**

| Phase | Skills |
|-------|--------|
| Meta | `ai-dev-guardrails`, `using-agent-skills` |
| Define | `interview-me`, `idea-refine`, `spec-driven-development` |
| Plan | `planning-and-task-breakdown` |
| Build | `incremental-implementation`, `test-driven-development`, `frontend-ui-engineering`, `api-and-interface-design`, `context-engineering`, `source-driven-development`, `doubt-driven-development` |
| Verify | `browser-testing-with-devtools`, `debugging-and-error-recovery` |
| Review | `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization` |
| Ship | `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `observability-and-instrumentation`, `shipping-and-launch` |

Supporting trees: [`agents/`](agents/) (personas), [`references/`](references/) (checklists), [`commands/`](commands/) (slash commands), [`hooks/`](hooks/), [`docs/`](docs/).

**AI directive:** After reading `SRS.md`, select and follow the matching skill(s) under `skills/`, then apply Rules §§1–6 for the project type. Name the skills used in the compliance report.

### Skill LIFECYCLE-02 — Prefer the installable meta skill

> **Severity:** `medium` · **Status:** `complete`

**Summary:** When this pack is installed via `npx skills` (or synced into the agent skills directory), prefer invoking **`ai-dev-guardrails`** as the session entrypoint so SRS + Rules + lifecycle discovery stay consistent.

**Rules**
- If `ai-dev-guardrails` is available to the agent, follow it before ad-hoc interpretation of this file alone.
- Still respect project-type applicability (README matrix) — the meta skill does not force unused CS/SS/OPS packs.
- When installing for a new project, recommend `npx skills add aftab-ahmad-khan-dev/ai-dev-guardrails` plus copying `SRS.md` / `Rules.md` (or YAML packs).

**AI directive:** On pack-aware sessions, start from `ai-dev-guardrails`; otherwise follow §0 SRS-01 → LIFECYCLE-01 → §§1–6.

---
## 1. Client-Side Rules

**Stack:** React, Tailwind CSS, Framer Motion, GSAP, React Helmet

| ID | Rule | Severity |
|----|------|----------|
| CS-01 | Code Organization & Componentization | high |
| CS-02 | State Management | high |
| CS-03 | API Integration & Data Fetching | high |
| CS-04 | Error Handling & Logging | high |
| CS-05 | Performance Optimization | high |
| CS-06 | Accessibility (a11y) | high |
| CS-07 | SEO, Meta Tags & OG Images | high |
| CS-08 | Responsive Design & Mobile-First | high |
| CS-09 | Animation & Motion (Framer Motion / GSAP) | medium |
| CS-10 | Form Handling & Validation | medium |
| CS-11 | Testing Standards | medium |
| CS-12 | Styling & Design System (Tailwind) | high |
| CS-13 | Routing & Navigation | medium |
| CS-14 | Internationalization (i18n) | medium |
| CS-15 | Asset & Image Optimization | medium |
| CS-16 | Environment Configuration | critical |
| CS-17 | Code Review & Git Workflow | medium |
| CS-18 | Component Library & Design Tokens | high |
| CS-19 | Analytics & Tracking | medium |
| CS-20 | PWA & Offline Support | medium |

### CS-01 — Code Organization & Componentization

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep the frontend modular, scalable, and easy to navigate. No file exceeds 400 LOC; pages orchestrate only; logic lives in hooks/services.

**Rules**
- Max file length — no file exceeds 400 LOC. Refactor before it happens, not after.
- Page files only orchestrate layout + data wiring. No business logic, no large inline JSX blocks.
- Each component has a single responsibility. Split any component rendering more than ~2 independent UI sections.
- Business/data logic goes into hooks/ (stateful) or services/ (API calls, pure functions), never inline in components.
- Group by feature/domain, not by file type.

**Do**
- Before generating code, estimate output size; if over 400 LOC, proactively split into components/hooks/services/utils.
- Co-locate page-private components under pages/<Feature>/components/.
- Promote shared UI to src/components/ once reused in 2+ places.

**Don't**
- God components that fetch data, manage state, and render 5 sections.
- Copy-pasted JSX blocks instead of extracting a reusable component.
- Business logic (calculations, transforms, validation) living inside JSX.
- Dump an entire feature into one file for convenience.

**Example (good)**
```
src/pages/Dashboard/
├── Dashboard.jsx
├── components/{StatsCard,UserTable}.jsx
├── hooks/useDashboardData.js
└── services/dashboardService.js
```

**AI directive:** Estimate file size before generating. Never dump a whole feature into one file. Split into feature folders with components, hooks, and services.

---

### CS-02 — State Management

> **Severity:** `high` · **Status:** `complete`

**Summary:** Prevent unpredictable state, prop-drilling, and re-render storms. Local first; global only when truly shared.

**Rules**
- Local first — useState/useReducer unless data is truly shared across distant components.
- Lift state only as high as the nearest common ancestor that needs it.
- Global store (Zustand/Redux/Context) only for auth/session, theme, cart/checkout, or data used by 3+ unrelated components.
- No prop drilling past 2 levels untouched — introduce Context or a store.
- Never store data in state that can be computed from existing state/props.
- Every async slice tracks { data, loading, error } consistently.
- Never mutate state directly; always return new references.

**Do**
- Keep form input values local to the form component.
- Use selectors for derived store data.
- Separate server-state (React Query/SWR) from UI-state.

**Don't**
- Duplicating server data into multiple stores.
- Storing derived/computed values as separate state.
- Using global state for form inputs local to one component.

**Example (good)**
```
src/store/
├── auth/{authSlice,authSelectors}.js
└── cart/{cartSlice,cartSelectors}.js
```

**AI directive:** Default to local state. Justify any global store. Keep async slices as { data, loading, error }. Never mutate state.

---

### CS-03 — API Integration & Data Fetching

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep data-fetching predictable, cached, and decoupled from UI via a single API layer and domain services.

**Rules**
- All HTTP calls go through one services/api client with base URL + interceptors. No raw fetch() in components.
- One service per domain (userService, orderService) exporting functions, not scattered endpoint strings.
- Use React Query/SWR (or equivalent) for caching, retries, and stale-while-revalidate when available.
- Normalize API errors to { message, code, status } at the interceptor level.
- Services fetch and return data; transformation/business rules live in hooks or utils.
- Never hardcode API URLs — read from environment config.
- Abort in-flight requests on unmount/param change to prevent race conditions.

**Do**
- Centralize auth header injection in interceptors.
- Document each service function next to the backend contract it calls.

**Don't**
- Fetch calls duplicated across components for the same endpoint.
- Hardcoded tokens or API keys in service files.
- Swallowing errors silently (empty catch blocks).

**AI directive:** Route every HTTP call through the shared API client and domain services. Prefer React Query/SWR over manual useEffect fetch boilerplate. Never put secrets in services.

---

### CS-04 — Error Handling & Logging

> **Severity:** `high` · **Status:** `complete`

**Summary:** Fail gracefully and make issues traceable without leaking sensitive data.

**Rules**
- Wrap route-level and high-risk sections in React Error Boundaries with friendly fallback UI.
- Never show raw stack traces or backend error payloads to end users.
- Route all client error logging through one utility (utils/logger.js) so the sink can be swapped.
- Never log tokens, passwords, PII, or full request/response bodies containing user data.
- One shared notification system for success/error/warning — no ad-hoc alert().
- Every data-fetching hook must handle offline/timeout states, not just happy path.
- Retry/backoff for idempotent GETs; mutating POSTs generally do not auto-retry.

**Do**
- Provide loading, empty, and error UI for every data-driven view.
- Strip console.log from production builds via tooling.

**Don't**
- console.log left in production builds.
- Generic catch (e) {} blocks that hide failures.
- Logging entire user objects or auth tokens for debugging.

**AI directive:** Generate error boundaries, friendly fallbacks, and a centralized logger. Never leak stacks or secrets to users or logs.

---

### CS-05 — Performance Optimization

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep the app fast on real-world devices and networks.

**Rules**
- Route-based lazy loading (React.lazy/dynamic import) for every top-level page.
- useMemo/useCallback/React.memo only where profiling shows real cost — not by default everywhere.
- Responsive images (srcset), lazy-load below-the-fold, modern formats (WebP/AVIF).
- Set a max bundle size per route (e.g. 200KB gzipped); CI fails if exceeded when tooling exists.
- Lists/tables over ~100 rows use windowing/virtualization.
- Prefer CSS transforms/opacity for animation over layout properties.
- Every added library must be justified against bundle-size cost.

**Do**
- Debounce high-frequency handlers (search, resize).
- Move heavy sync computation to a Web Worker when needed.

**Don't**
- Importing an entire icon/utility library when only a few exports are used.
- Re-rendering large lists on every keystroke without debouncing.
- Blocking the main thread with heavy synchronous computation.

**AI directive:** Default to route-level code splitting. Memoize only when needed. Virtualize long lists. Justify every heavy dependency.

---

### CS-06 — Accessibility (a11y)

> **Severity:** `high` · **Status:** `complete`

**Summary:** Ensure the product is usable by people with disabilities and meets WCAG 2.1 AA.

**Rules**
- Semantic HTML first — button, nav, label before ARIA.
- Every interactive element keyboard reachable and operable.
- Modals/drawers trap focus and return it to the trigger on close.
- Text contrast minimum 4.5:1 (3:1 large text).
- Meaningful images have descriptive alt; decorative use alt="".
- Every input has an associated visible label (not placeholder-only).
- Async status updates announced via aria-live.
- Never convey information through color or motion alone.

**Do**
- Provide visible focus styles when customizing outlines.
- Honor prefers-reduced-motion for non-essential motion.

**Don't**
- div onClick as a button without role and keyboard handlers.
- Removing focus outlines without a visible alternative.
- Auto-playing motion/video without pause or reduced-motion check.

**AI directive:** Produce accessible markup by default — semantics, labels, keyboard, focus traps, contrast, and live regions.

---

### CS-07 — SEO, Meta Tags & OG Images

> **Severity:** `high` · **Status:** `complete`

**Summary:** Every page is discoverable, correctly indexed, and shares beautifully on social platforms.

**Rules**
- Every route sets its own title, meta description, and canonical via React Helmet (or equivalent).
- Every shareable page includes og:title, og:description, og:image, og:url, twitter:card.
- Pixel-perfect 1200x630 OG image per platform/page in public/og/ (og-<page>.png) — not a stretched logo.
- Full favicon set: favicon.ico, 32x32, 16x16, apple-touch-icon, site.webmanifest.
- Add JSON-LD structured data where relevant.
- Maintain sitemap.xml and correct robots.txt.
- One h1 per page; never skip heading levels for styling.

**Do**
- Unique title/description per route.
- Include theme-color and apple-touch-icon.

**Don't**
- Reusing one generic OG image across every page.
- Missing or duplicate title tags across routes.
- Empty, truncated, or keyword-stuffed meta descriptions.
- Shipping framework default favicons.

**Example (good)**
```
<Helmet>
  <title>Dashboard — Acme</title>
  <meta name="description" content="Your Acme analytics at a glance." />
  <meta property="og:image" content="/og/og-dashboard.png" />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
```

**AI directive:** For every page/platform generate Helmet meta + OG/Twitter tags, a 1200x630 branded OG image, and a full favicon set.

---

### CS-08 — Responsive Design & Mobile-First

> **Severity:** `high` · **Status:** `complete`

**Summary:** Guarantee a consistent, polished experience across all devices and breakpoints.

**Rules**
- Mobile-first CSS — base for mobile, then min-width breakpoints (Tailwind default).
- Standard breakpoints only: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536.
- Prefer rem/%/clamp for typography and spacing over fixed pixels.
- Touch targets at least 44x44px on touch devices.
- Verify at 375, 768, 1280, and 1920 widths minimum.
- No unintended horizontal scroll at any breakpoint.
- Media is fluid (max-width 100%) with responsive srcset/sizes.

**Do**
- Stack layouts on small screens; expand at md/lg.
- Provide tap equivalents for hover-only interactions.

**Don't**
- Fixed pixel widths on containers that should flex.
- Desktop-only hover with no touch equivalent.
- Separate mobile site trees duplicating desktop logic.

**AI directive:** Generate mobile-first Tailwind layouts with standard breakpoints. Never cause horizontal scroll. Ensure touch-friendly targets.

---

### CS-09 — Animation & Motion (Framer Motion / GSAP)

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Use motion purposefully to guide attention — Framer Motion for UI, GSAP for timelines/scroll.

**Rules**
- Every animation communicates state change, hierarchy, or feedback — never motion for its own sake.
- Micro-interactions 150–250ms; page/section transitions 300–500ms. Shared easing config.
- Always honor prefers-reduced-motion.
- Animate transform/opacity only — not width/height/top/left.
- Framer Motion for component/state animation; GSAP for complex timeline/scroll. Do not mix both on the same element.
- Reusable Framer variants live in animations/ — not inlined everywhere.
- Never delay critical above-the-fold content beyond ~300ms for decoration.

**Do**
- Ship 2–3 intentional motions on visually led pages.
- Throttle scroll-linked work; avoid per-pixel unthrottled handlers.

**Don't**
- Infinite looping animations near primary content.
- GSAP timelines with hardcoded pixel values that break on resize.
- Animating on every scroll pixel without rAF/throttling.

**AI directive:** Add tasteful accessible motion. Honor reduced-motion. Use Framer Motion or GSAP per concern — not both on one element. Animate transform/opacity only.

---

### CS-10 — Form Handling & Validation

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep forms consistent, accessible, and safe from bad input.

**Rules**
- One form library project-wide (e.g. React Hook Form) + schema validator (Zod/Yup) beyond 1–2 fields.
- Validation schemas live per form and align with server contracts where possible.
- Validate on blur/change and always re-validate on submit.
- Errors via aria-describedby and announced to screen readers.
- Disable submit and show loading during async submission.
- Clear password/payment fields from state immediately after submission.
- Shared components/form/ inputs — not one-off styled inputs per page.

**Do**
- Preserve user input on validation failure.
- Always re-validate security-relevant rules server-side.

**Don't**
- Client-side-only validation for security-relevant rules.
- Silently clearing a form on error.
- Submit-only validation with no earlier feedback on long forms.

**AI directive:** Generate schema-validated accessible forms with pending submit states. Never treat client validation as the only security gate.

---

### CS-11 — Testing Standards

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Catch regressions early with a clear test pyramid and behavior-focused tests.

**Rules**
- Majority unit, moderate integration, few critical E2E (Playwright/Cypress) for core flows.
- Co-locate Component.test.jsx next to Component.jsx.
- Query by role/text (Testing Library) — not internal state or class names.
- CI coverage floor on hooks/, services/, utils/ (e.g. 70%); UI glue may be exempt.
- Mock network at the boundary (MSW) rather than internal service functions when testing pages.
- Auth, checkout/payment, and primary conversion always have E2E coverage.
- Never use fixed sleep waits — wait for conditions/elements.

**Do**
- Cover happy path plus empty/error/validation failure.
- Keep tests deterministic.

**Don't**
- Snapshot tests as the only coverage for complex logic.
- Asserting on CSS class names instead of user-visible behavior.
- Skipping/disabling failing tests instead of fixing them.

**AI directive:** Generate behavior-focused tests with Testing Library queries. Include error states. Mock network at the boundary. No flaky sleeps.

---

### CS-12 — Styling & Design System (Tailwind)

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep visual language consistent via tokens; avoid one-off drifting styles and generic AI aesthetics.

**Rules**
- Colors, spacing, typography, radii, shadows defined in tailwind.config theme — never hardcoded hex/px in components.
- Utility-first; extract a component (not @apply soup) once a pattern repeats 3+ times.
- Avoid arbitrary values (w-[437px]) by default; promote repeats to tokens.
- Use theme spacing scale exclusively.
- Dark mode via CSS variables/tokens, not duplicated component variants.
- Shared components/ui/ for buttons, inputs, cards, badges.
- Enforce class ordering via prettier-plugin-tailwindcss when available.
- Avoid cliché AI looks (purple-on-white gradients, cream+terracotta kits, glow pill spam) unless brand requires them.
- Stats/metrics sections use a visible bottom border or divider (`border-b` with a design-token color) to separate them from the following section, unless an approved design explicitly provides equivalent separation.
- Every public metric must be realistic and traceable to product data or an approved source. If verified data is unavailable, use clearly labeled placeholders or omit the stats section—never invent impressive numbers.

**Do**
- Establish tokens before building screens.
- Cards only when they contain interaction.
- Use conservative, exact or honestly rounded values backed by a source and state the measurement period where relevant.
- Give stats sections consistent vertical spacing and a full-width bottom divider with sufficient contrast.

**Don't**
- Copy-pasting long className strings across files.
- Hardcoded brand colors outside the token file.
- Inline style={{ }} for anything expressible via Tailwind.
- Fabricated vanity claims such as `900+ Integrations`, `99.99% Uptime`, `200+ Currencies`, or `<3 wks Typical go-live` without documented evidence.
- Removing the stats section’s bottom border so it visually merges into the next section.

**AI directive:** Use design tokens and a shared UI kit. Stats sections require a visible token-based bottom border and credible, sourced values; never generate inflated or unsupported metrics. Avoid arbitrary values and generic AI aesthetics.

---

### CS-13 — Routing & Navigation

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep navigation predictable, deep-linkable, and SEO/accessibility friendly.

**Rules**
- All routes declared in one routes/ config — not scattered Route definitions.
- Every top-level route is code-split via lazy import.
- Auth-gated routes use one shared ProtectedRoute wrapper.
- URLs reflect resource hierarchy (/orders/:id) — not query-string-only primary navigation.
- Route changes reset scroll to top unless intentionally preserved.
- Dedicated catch-all 404 and route-level error boundary.
- Active nav/breadcrumb derived from route config.

**Do**
- Reflect filters/pagination in the URL when shareable.
- Use the router for internal navigation.

**Don't**
- window.location.href for internal navigation.
- Critical UI state only in component state when it should be in the URL.
- Duplicated auth-check logic pasted into every protected page.

**AI directive:** Centralize route config with lazy routes, one ProtectedRoute wrapper, 404/error routes, and meaningful URLs.

---

### CS-14 — Internationalization (i18n)

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Make the app translation-ready and locale-safe from day one, even if only one language ships first.

**Rules**
- All user-facing text through t(key) — never inline literals in JSX.
- Namespaced translation files by feature/page — not one giant flat file.
- Dates, numbers, currency via Intl or locale-aware library.
- Use i18n plural rules API — not manual count === 1 ternary strings.
- Prefer logical CSS properties for RTL readiness.
- Always define a fallback locale.
- Semantic keys (checkout.submitButton) — not raw English as the key.

**Do**
- Keep locale files in a shared locales/ directory.
- Avoid concatenating translated fragments into sentences.

**Don't**
- Concatenating translated fragments (breaks grammar).
- Hardcoding MM/DD/YYYY app-wide.
- Storing translations inline in component files.

**AI directive:** Route all user-facing strings through i18n keys with namespaces, Intl formatting, pluralization, and a fallback locale.

---

### CS-15 — Asset & Image Optimization

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Minimize payload size and maximize load performance for static assets.

**Rules**
- Serve WebP/AVIF with fallbacks; never ship unoptimized raw design exports.
- Provide srcset/sizes so devices download only what they need.
- Below-the-fold images/iframes use loading=lazy; LCP/hero may be eager.
- SVG (SVGO-optimized) for icons/simple illustrations.
- Self-host fonts where possible, subset, font-display swap.
- Build-time image optimization (sharp/imagemin) — not raw commits.
- CDN delivery with proper cache headers when available.

**Do**
- Set width/height or aspect-ratio to prevent CLS.
- OG images at 1200x630 per CS-07.

**Don't**
- Committing multi-MB unoptimized images.
- Raster PNG where an SVG icon would work.
- Full-resolution hero images for mobile viewports.

**AI directive:** Generate optimized responsive images with modern formats, lazy-loading for non-LCP, and explicit dimensions.

---

### CS-16 — Environment Configuration

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Keep environment-specific values out of code and safely managed per deployment target. Client bundles are always public.

**Rules**
- All env-dependent values read from one config/env.js wrapping import.meta.env/process.env.
- .env.example lists every client env var as placeholders and stays in sync.
- Only public-prefixed vars (VITE_, NEXT_PUBLIC_) may enter the client bundle.
- Public-prefixed values are still exposed to every browser user. Never describe them as secured, hidden, or protected by `.env`.
- Tracking/config identifiers (Meta Pixel IDs, Clarity project IDs, GA measurement IDs, Sentry DSNs, map tokens, etc.) must come from validated client-safe env vars with placeholder-only examples — never real hardcoded literals or production fallback values.
- API secrets, private keys, DB credentials must never be referenced in client env.
- .env.development/.staging/.production stay structurally identical (same keys).
- Validate required env vars at build/startup and fail fast if missing.

**Do**
- Proxy secret-bearing third-party calls through the backend.
- Document each public var purpose.

**Don't**
- Committing real .env files with secrets.
- Reading process.env.X ad-hoc inside random components.
- Putting a payment secret in a client-exposed env var.
- Using `import.meta.env.VITE_META_PIXEL_ID || "real-production-id"` or arrays of literal provider IDs; the fallback and literals are shipped in the bundle.

**AI directive:** Centralize env behind config/env.js. Treat every client env value as public, flag real hardcoded IDs/fallbacks, and never claim `VITE_`/`NEXT_PUBLIC_` values are secured. Keep secrets server-side and fail fast on missing required config.

---

### CS-17 — Code Review & Git Workflow

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep history clean, reviewable, and safe to roll back.

**Rules**
- Branch naming: feature|fix|chore/<ticket>-short-desc.
- One logical change per PR; split when >~400 changed LOC where feasible.
- Conventional commits: type(scope): message.
- No direct pushes to main — PR + review + passing CI.
- Pre-commit lint/format/typecheck (Husky + lint-staged) when the project uses them.
- A pre-push hook/script must run the applicable local test and security suite before network push: tests, lint/typecheck, dependency audit, secret scan, exposed client-config scan, and build when configured.
- Any failed test or high/critical security result blocks the push. Fix locally and rerun; bypassing with `--no-verify` requires explicit documented emergency approval.
- PR description: what, why, how tested, screenshots for UI.
- Prefer squash-merge for linear main history when team policy allows.

**Do**
- Keep AI workspace files out of git (see security pack).
- Never commit dist/, .next/, node_modules/.

**Don't**
- Committing generated build artifacts.
- Force-pushing over shared branches others use.
- Merging with failing CI or unresolved blocking review comments.
- Pushing first and waiting for remote CI to reveal failures that the required local pre-push suite can detect.

**AI directive:** Follow conventional commits, focused PRs, and protected main. Before every push, run the local test/security gate and report results; fix failures before pushing. Never bypass hooks or commit build artifacts/AI workspace files.

---

### CS-18 — Component Library & Design Tokens

> **Severity:** `high` · **Status:** `complete`

**Summary:** Ensure UI consistency and reduce duplicated styling via one UI kit and token-driven theming.

**Rules**
- Buttons, inputs, modals, cards, badges, tooltips live in components/ui/ (Storybook when available).
- All colors/spacing/radii/shadows/type come from central design tokens consumed by Tailwind.
- Components expose variants (variant, size) rather than arbitrary className overrides for core styling.
- Before creating a new UI component, check the library; extend/compose rather than duplicate.
- Base components ship with correct ARIA/keyboard handling by default.
- Breaking changes to shared components are called out in the PR description.

**Do**
- Document usage for shared components.
- Compose primitives instead of forking.

**Don't**
- Three different Button implementations across features.
- Overriding shared internals with !important.
- Hardcoding a one-off color not in the token palette.

**AI directive:** Reuse and extend components/ui/ with token-driven variants. Do not duplicate primitives or hardcode one-off colors.

---

### CS-19 — Analytics & Tracking

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Collect useful product data without harming performance, privacy, or code cleanliness.

**Rules**
- All analytics through one services/analytics.js wrapper — never call gtag/mixpanel directly from components.
- Provider/project IDs are public identifiers once bundled, not secrets. Load them from documented client-safe env vars so environments and consent policy remain controllable.
- No real tracking IDs as source-code literals, fallback strings, or hardcoded arrays. Missing IDs disable that provider or fail validation according to documented policy.
- Consistent noun_verb event names documented in a shared events dictionary.
- Never send raw emails, names, or payment details — use hashed/anonymized IDs.
- Load analytics only after cookie/consent where GDPR/CCPA requires it.
- Scripts load asynchronously and never block initial render.
- Guard against duplicate page-view fires on remount.

**Do**
- Keep an events dictionary in docs or code.
- Fail open for product UX if analytics is blocked.

**Don't**
- Scattering provider SDK calls across dozens of components.
- Logging full user objects as event metadata.
- Loading tracking scripts before consent is obtained.
- Treating a Meta Pixel ID, Clarity project ID, GA measurement ID, or similar client identifier as “secured” merely because it is read through `import.meta.env`.
- Shipping production tracking IDs as `env.VALUE || "literal"` defaults.

**AI directive:** Centralize analytics behind a consent-gated wrapper. Treat client tracking IDs as public configuration, require env-only values with no real fallback literals, and flag any exposed hardcoded provider ID during review.

---

### CS-20 — PWA & Offline Support

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Provide a resilient, installable experience when the network is unreliable.

**Rules**
- Complete manifest.json aligned with favicon/OG assets (name, icons, theme_color, display).
- Explicit SW strategies: cache-first for static assets; network-first with fallback for API data.
- Dedicated offline page/state — not a blank screen.
- Versioned cache names so stale caches purge on deploy.
- Queue offline mutations and replay when online where applicable.
- Custom install prompts after engagement — not on first paint.

**Do**
- Invalidate sensitive/user-specific cached API data appropriately.
- Bump cache version on every production deploy.

**Don't**
- Caching sensitive API responses indefinitely without invalidation.
- Service worker that swallows fetch failures with no offline UI.
- Forgetting to bump cache version (users stuck on stale assets).

**AI directive:** Ship a complete web manifest, versioned service-worker caching, offline fallback UI, and thoughtful install UX. Never cache sensitive data indefinitely.

---

## 2. Server-Side Rules

**Scope:** Extend existing boilerplate — Controllers → Services → Models → Routes → Middlewares. Skip if project has no backend.

| ID | Rule | Severity |
|----|------|----------|
| SS-01 | Layered Architecture & Code Organization | critical |
| SS-02 | API Design & REST Conventions | high |
| SS-03 | Database Schema & Migrations | high |
| SS-04 | Error Handling & Centralized Exception Middleware | high |
| SS-05 | Input Validation (Server-Side) | critical |
| SS-06 | Authentication & Session Management | critical |
| SS-07 | Authorization & RBAC | critical |
| SS-08 | Logging & Monitoring | medium |
| SS-09 | Caching Strategy | medium |
| SS-10 | Background Jobs & Queues | high |
| SS-11 | Rate Limiting & Throttling | high |
| SS-12 | File Upload Handling | high |
| SS-13 | Environment & Configuration Management | critical |
| SS-14 | Testing Standards (Backend) | medium |
| SS-15 | API Versioning | medium |
| SS-16 | Pagination, Filtering & Sorting | medium |
| SS-17 | Transaction Management & Data Integrity | critical |
| SS-18 | Third-Party Service Integration | high |
| SS-19 | Performance & Scalability | high |
| SS-20 | API Documentation | medium |

### SS-01 — Layered Architecture & Code Organization

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Keep the backend predictable and easy to extend. Strict Controllers→Services→Models. Extend the boilerplate — never replace it.

**Rules**
- Controllers never touch the database directly; models never contain HTTP-specific logic.
- Controllers only: parse request, call service, shape response.
- Services own business rules, calculations, and orchestration.
- Models define schema, relationships, and simple data-level validation — not business rules.
- Routes map verb+path to controller only — no inline logic.
- Auth, logging, rate limiting, validation live in middlewares/.
- No file exceeds 400 LOC; split large services into domain-focused modules.
- New features follow existing folders exactly — never introduce a parallel architecture.

**Do**
- Place new files only in existing folders.
- Keep code concise and consistent with neighbors.

**Don't**
- Controller querying the database directly.
- Business logic inside model methods.
- New top-level folder (e.g. handlers/) duplicating an existing layer.

**Example (good)**
```
src/
├── controllers/orderController.js
├── services/orderService.js
├── models/Order.js
├── routes/orderRoutes.js
├── middlewares/validateOrder.js
├── database/connection.js
├── startup/app.js
└── templates/
```

**AI directive:** Map every feature onto Controllers/Services/Models/Routes/Middlewares. Thin controllers, services for logic, extend — do not replace.

---

### SS-02 — API Design & REST Conventions

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep the API predictable and consistent for every frontend/client consuming it.

**Rules**
- Resource-based URLs — /orders, /orders/:id — nouns, not verbs.
- HTTP verbs match intent: GET read, POST create, PUT/PATCH update, DELETE remove.
- One response envelope project-wide (e.g. { success, data, error, meta }).
- Standard status codes used consistently (200/201/204/400/401/403/404/409/500).
- Plural resource names (/users not /user).
- Nesting limited to 1 level; beyond that use filters on a top-level resource.
- Critical POSTs (payments) support an idempotency key; PUT/DELETE are idempotent.

**Do**
- Align naming and shapes with frontend modules (FE↔BE).
- Keep field casing consistent across endpoints.

**Don't**
- Action-named endpoints like /updateUserStatus.
- Different success vs error shapes on the same endpoint.
- Mixing camelCase and snake_case field names across endpoints.

**AI directive:** Design REST resources with consistent envelopes, status codes, and plural nouns. Match frontend contracts. Support idempotency for critical POSTs.

---

### SS-03 — Database Schema & Migrations

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep schema changes safe, reversible, and consistent across environments.

**Rules**
- Every schema change goes through a versioned migration — no hand-edited production schema.
- Every migration includes up and down (or equivalent rollback).
- One logical change per migration file.
- Naming: YYYYMMDDHHMMSS_verb_description.
- Foreign keys, NOT NULL, and uniqueness enforced at DB level.
- Indexes for WHERE/JOIN/ORDER BY patterns added with the feature that needs them.
- No destructive migrations without backup/soft-deprecation.
- Seed data lives in seeds/ — never mixed into schema migrations.

**Do**
- Backfill before adding NOT NULL without default on large tables.
- Review EXPLAIN for new query patterns.

**Don't**
- Ad-hoc ALTER TABLE on production outside migrations.
- Migration with no rollback for a reversible change.
- Adding required columns without a backfill plan.

**AI directive:** Generate reversible, single-purpose migrations with DB-level constraints and indexes. Never hand-edit production schema.

---

### SS-04 — Error Handling & Centralized Exception Middleware

> **Severity:** `high` · **Status:** `complete`

**Summary:** Failures handled consistently and safely without leaking internals.

**Rules**
- All errors flow through one centralized error middleware.
- Typed error classes (ValidationError, NotFoundError, UnauthorizedError) with statusCode.
- Never leak stacks, DB messages, or file paths to clients in production.
- Every async controller wrapped so rejections hit the error middleware.
- Consistent error shape { success:false, error:{ code, message } }.
- Fail fast on missing config/DB at boot.
- Graceful shutdown on SIGTERM/SIGINT.

**Do**
- Log full detail server-side; return sanitized client messages.
- Use correct HTTP status codes.

**Don't**
- Empty catch blocks swallowing errors.
- Returning raw ORM errors to the client.
- Duplicating error formatting in every controller.

**AI directive:** Use centralized error middleware and typed errors. Never leak internals. Wrap async handlers. Fail fast on boot; shut down gracefully.

---

### SS-05 — Input Validation (Server-Side)

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Every request is checked at the boundary regardless of client validation.

**Rules**
- Schema validation middleware (Zod/Joi/class-validator) before controllers.
- Reject unknown fields (strict / stripUnknown).
- Bound numbers, dates, enums, and string lengths explicitly.
- Field-level validation errors that are descriptive but safe.
- Sanitize (trim, normalize) before persisting.
- Re-check file type via magic bytes and size server-side.
- Share schemas with frontend where possible to avoid drift.

**Do**
- Attach validators on every body/query/params route.
- Never pass raw req.body into ORM create.

**Don't**
- Trusting frontend validation alone.
- Accepting arbitrary extra fields and saving the whole object.
- Validating only presence without type/format.

**AI directive:** Add strict schema validation middleware for every input endpoint. Sanitize before persist. Never trust the client alone.

---

### SS-06 — Authentication & Session Management

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Authentication that is secure by default and consistent across protected routes.

**Rules**
- One authenticate middleware verifies token/session and attaches req.user.
- bcrypt (cost >= 10) or argon2 via shared hash/verify utilities.
- Short-lived access tokens; longer refresh tokens stored securely and revocable.
- Logout, password change, and suspension invalidate sessions server-side.
- 401 unauthenticated vs 403 unauthorized — never conflated.
- JWTs carry only non-sensitive claims (user id, role).
- Login/OTP endpoints rate-limited with failure logging.

**Do**
- Reuse existing auth middleware — do not reinvent.
- Prefer HttpOnly Secure cookies when cookie-based.

**Don't**
- Re-implementing token verification in multiple route files.
- Non-expiring access tokens.
- Storing refresh tokens in plaintext in the DB.

**AI directive:** Use shared auth middleware, strong password hashing, short-lived tokens, and server-side session invalidation. Correct 401 vs 403.

---

### SS-07 — Authorization & RBAC

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Every action is checked against what the authenticated user is allowed to do.

**Rules**
- Authorization always server-side; never trust client-provided roles.
- Central permissions module + authorize(permission) middleware — not scattered role checks.
- Resource-level ownership checks, not only route-level.
- Least privilege by default — permissions explicitly granted.
- Admin actions audited (actor, action, timestamp).
- Deny by default on ambiguity/misconfiguration.

**Do**
- Check ownership for user-scoped resources.
- Separate admin capabilities from standard users.

**Don't**
- Checking req.body.role for admin.
- Route-level checks without ownership checks (IDOR).
- Broad super-admin for internal tools by default.

**AI directive:** Enforce server-side RBAC with centralized permissions, resource ownership checks, audit logging, and default deny.

---

### SS-08 — Logging & Monitoring

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Observable backend without leaking sensitive data or drowning in noise.

**Rules**
- Structured logger (Pino/Winston) with levels — no bare console.log in production paths.
- Request-scoped correlation ID on every log line.
- Auto-redact password, token, authorization, ssn, cardNumber.
- Expose /health and /ready for orchestrators.
- Track latency, error rate, throughput; alert on anomalies.
- Log actionable business events and errors — not every trivial read.
- Debug verbosity in non-production by default.

**Do**
- Hook into existing APM when present.
- Never log auth/payment bodies.

**Don't**
- Logging full bodies for auth/payment endpoints.
- console.log for error tracking.
- No alerting — outages discovered via user complaints.

**AI directive:** Use structured leveled logs with correlation IDs and redaction. Expose health/ready. Alert on anomalies. Never log secrets.

---

### SS-09 — Caching Strategy

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Improve performance without serving stale or leaking per-user data.

**Rules**
- HTTP caching for public/static; Redis (or equivalent) for expensive/frequent reads.
- Every cached value has an explicit TTL.
- Mutations invalidate/update relevant keys — do not rely on TTL alone for immediate consistency.
- Documented key naming (user:{id}:profile).
- Never cache one users personalized response under a shared key.
- If cache is down, fall back to source of truth.

**Do**
- Scope keys per user/tenant when needed.
- Treat cache as performance layer, not source of truth.

**Don't**
- Personalized responses under unscoped keys (cross-user leak).
- Missing TTL causing permanent staleness.
- Treating cache as source of truth.

**AI directive:** Cache with explicit TTLs, write-time invalidation, scoped keys, and graceful fallback when the cache is unavailable.

---

### SS-10 — Background Jobs & Queues

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep long-running or unreliable work off the request cycle and make it resilient.

**Rules**
- Emails, notifications, reports, and slow third-party sync run as jobs (BullMQ/etc.).
- Job handlers are idempotent under retries.
- Retry with exponential backoff; then dead-letter — never silent drop.
- Pass IDs/references in payloads, not large objects.
- Monitor queue depth, failure rate, latency.
- Cron jobs live in one central schedule registry.

**Do**
- Avoid double-charges/emails on retry.
- Alert when queues back up.

**Don't**
- Sending email/slow APIs synchronously in the request handler.
- Non-idempotent handlers causing duplicates on retry.
- No dead-letter handling.

**AI directive:** Offload non-critical work to idempotent queued jobs with backoff, dead-letter, small payloads, and queue health monitoring.

---

### SS-11 — Rate Limiting & Throttling

> **Severity:** `high` · **Status:** `complete`

**Summary:** Protect resources from abuse and ensure fair usage across clients.

**Rules**
- Counters in Redis (shared store) for multi-instance correctness.
- Tiered limits: strictest on auth/OTP; generous on reads; cost-based on heavy writes.
- Authenticated: limit by user (primary) and IP (secondary); unauthenticated by IP.
- Return X-RateLimit-* and Retry-After headers.
- Thresholds in config — not magic numbers in routes.
- Internal service exemption only via explicit authenticated bypass.

**Do**
- Return proper 429 responses.
- Align with security rate-limit rules.

**Don't**
- In-memory limits on horizontally scaled services.
- Same limit for /login and /products.
- Silently dropping over-limit requests.

**AI directive:** Implement Redis-backed, tiered rate limits with standard headers and 429 responses. Strictest limits on auth endpoints.

---

### SS-12 — File Upload Handling

> **Severity:** `high` · **Status:** `complete`

**Summary:** Handle uploads safely without exposing the server or storage to abuse.

**Rules**
- Max size and allowed MIME enforced server-side via content sniffing, not just extension.
- Store in object storage (S3/Spaces) via signed URLs/streaming — not local disk in production.
- Randomized server-generated filenames (UUID) — never raw user filenames.
- Malware scan public downloads where feasible.
- Private files via time-limited signed URLs.
- Strip EXIF/location from images when privacy matters.
- Upload endpoints enforce the same authz as other writes.

**Do**
- Validate magic bytes.
- Never use world-writable public folders for uploads.

**Don't**
- Using raw user filename as storage path (path traversal).
- Predictable public paths for private files.
- Trusting client Content-Type alone.

**AI directive:** Validate type/size server-side, store with UUID names in object storage, use signed URLs for private files, and auth upload routes.

---

### SS-13 — Environment & Configuration Management

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Backend configuration explicit, validated, and safely separated per environment.

**Rules**
- All env-derived config loaded once into a typed config module; app imports that — not scattered process.env.
- Schema-validate required env at boot; refuse to start if critical missing.
- Keep privileged analytics/marketing credentials, conversion API tokens, webhook secrets, and administrative vendor calls server-only; expose only explicitly classified public identifiers to the client.
- When the frontend needs a public provider ID, supply it through environment/deployment configuration—not a hardcoded source fallback—and never send server credentials alongside it.
- Avoid NODE_ENV branching in business logic — branch at composition/config.
- Dev/staging/prod have separate DBs, keys, and queues.
- Risky behavior behind feature flags.
- Document every config value purpose, required/optional, default.

**Do**
- Fail fast with clear boot errors.
- Never share production DB with lower envs.

**Don't**
- Reading process.env.DB_URL inside random services.
- Sharing one DB across development and production.
- Defaulting missing critical secrets to empty string.
- Returning secret vendor credentials from config/bootstrap endpoints or embedding them in rendered HTML/client bundles.

**AI directive:** Centralize and schema-validate config at startup. Keep privileged marketing/analytics credentials server-only, expose only classified public IDs, and never use real hardcoded fallbacks in server or client configuration.

---

### SS-14 — Testing Standards (Backend)

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Ensure correctness and prevent regressions in business-critical logic.

**Rules**
- Highest unit-test priority on services/.
- Integration tests against a real test DB (or ephemeral container), not fully mocked ORM only.
- Cover success, validation failure, unauthorized, and not-found — not just happy path.
- Isolated test data (setup/teardown or transactional rollback).
- Mock third-party APIs — never hit real payment/email in unit/integration.
- CI blocks merge on failing tests or below coverage thresholds.
- Contract/smoke tests for critical third parties against sandbox periodically.

**Do**
- Prefer testing behavior at service and HTTP boundaries.
- Never skip failing tests to unblock merges.

**Don't**
- Happy-path-only tests.
- Mutating shared/production-like data without cleanup.
- Disabling failing tests to unblock a merge.

**AI directive:** Prioritize service unit tests and real-DB integration tests covering authz and validation failures. Mock externals. Gate CI on green tests.

---

### SS-15 — API Versioning

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Allow the API to evolve without breaking existing clients.

**Rules**
- Version in URL path (/api/v1/...) for public APIs.
- Breaking changes require a new version — never silent in-place breaks.
- Additive optional fields/endpoints can ship in current version.
- Documented deprecation window with Deprecation/Sunset headers.
- Version controllers are thin adapters over shared services — do not duplicate business logic.
- Maintain a changelog of version differences.

**Do**
- Coordinate breaking changes with frontend.
- Keep envelopes consistent within a version.

**Don't**
- Changing field types or removing fields in live v1 without a bump.
- Duplicating entire services per version.
- Removing old versions with no notice.

**AI directive:** Use path versioning, bump on breaking changes, share core services across versions, and communicate deprecations.

---

### SS-16 — Pagination, Filtering & Sorting

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep list endpoints performant and predictable regardless of dataset size.

**Rules**
- Pagination mandatory on collections that can grow.
- Cursor-based for large/real-time data; offset OK for small admin lists.
- One documented convention (?page&limit or ?cursor&limit, sort, filter) across endpoints.
- Hard server-side max limit (e.g. 100).
- Allowlist filter/sort fields — never raw client fields into ORDER BY.
- Include meta (total/hasNextPage) thoughtfully; avoid expensive COUNT(*) every time on huge tables.

**Do**
- Reuse a shared list-query parser.
- Align meta with frontend expectations.

**Don't**
- Unbounded GET /users returning the whole table.
- Arbitrary sort expressions into SQL ORDER BY.
- Inconsistent param names across endpoints.

**AI directive:** Paginate all growing lists with allowlisted filters/sorts, a hard max limit, and consistent meta. Prefer cursors for large feeds.

---

### SS-17 — Transaction Management & Data Integrity

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Multi-step operations fully succeed or fully roll back.

**Rules**
- Multi-table writes that must succeed together run in a transaction.
- Any failure rolls back the entire transaction.
- Use locking or optimistic concurrency (version columns) for inventory/balances.
- Idempotency keys for payments/critical mutations.
- DB constraints as safety net (FK, unique, check) — not the only line of defense.
- Transactional outbox when a write must also emit an external event.

**Do**
- Never leave partial writes after mid-operation crashes.
- Rely on unique constraints for true uniqueness.

**Don't**
- Order create + inventory deduct as two unguarded writes.
- Payment webhooks without idempotency (duplicate orders).
- Application-only uniqueness without a DB unique constraint.

**AI directive:** Wrap multi-step writes in transactions with proper locking/idempotency. Use constraints and outbox patterns for integrity.

---

### SS-18 — Third-Party Service Integration

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep external dependencies from destabilizing core reliability.

**Rules**
- Each vendor wrapped in services/integrations/ adapter — business logic never calls vendor SDK directly.
- Explicit timeouts on every outbound HTTP call.
- Retries with backoff on transient idempotent failures; non-idempotent need idempotency keys.
- Verify webhook signatures before processing.
- Non-critical vendor failures degrade gracefully — core request still succeeds.
- Sandbox credentials in non-production only.

**Do**
- Isolate payment/email/SMS behind adapters.
- Never process unsigned webhooks.

**Don't**
- Calling payment SDK from a controller.
- No timeout on outbound calls.
- Processing webhooks without signature verification.

**AI directive:** Wrap third parties in adapters with timeouts, backoff, signature-verified webhooks, graceful degradation, and sandbox creds in non-prod.

---

### SS-19 — Performance & Scalability

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep the backend responsive as data volume and traffic grow.

**Rules**
- Prevent N+1 via joins/eager load/DataLoader batching.
- Review new query patterns with EXPLAIN before shipping.
- Stateless app servers — no critical in-memory session/shared cache for horizontal scale.
- Tune DB connection pools deliberately.
- Offload CPU-heavy work to jobs/workers — do not block the event loop.
- Load-test critical endpoints before major launches.
- Shed non-critical features under load to protect checkout/auth.

**Do**
- Prefer batching over per-item queries.
- Keep instances horizontally scalable.

**Don't**
- Loop issuing one query per item.
- In-memory sessions behind a load balancer without sticky necessity addressed.
- Large PDF/report generation inline in the request handler.

**AI directive:** Eliminate N+1, index deliberately, keep servers stateless, tune pools, and offload heavy work. Load-test before peaks.

---

### SS-20 — API Documentation

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep the API self-describing for frontend and integration consumers.

**Rules**
- Maintain OpenAPI/Swagger for every endpoint.
- Include request/response examples for success and errors.
- Document auth and role requirements per endpoint.
- CI validates the OpenAPI spec (and ideally matches routes).
- Changelog for breaking/notable consumer-facing changes.
- Maintain an error-code reference table.

**Do**
- Keep docs in sync with implementation.
- Document error shapes, not only happy path.

**Don't**
- Shipping undocumented endpoints.
- OpenAPI drifting with no verification.
- Documenting only happy-path responses.

**AI directive:** Maintain OpenAPI with examples, auth notes, error codes, and CI validation. Changelog consumer-facing changes.

---

## 3. Variable & Naming Conventions

Apply these across **client**, **server**, and **security** unless the project already has an established convention — then mirror it exactly.

### 3.1 General

| Kind | Convention | Example |
|------|------------|---------|
| Variables & functions | `camelCase` | `getUserById`, `isLoading` |
| React components & classes | `PascalCase` | `UserTable`, `AuthService` |
| Component files | `PascalCase.jsx` / `.tsx` | `UserTable.tsx` |
| Hooks | `use` + `PascalCase` | `useDashboardData` |
| Constants & env vars | `SCREAMING_SNAKE_CASE` | `JWT_SECRET`, `MAX_RETRY_COUNT` |
| Folders (non-component) | `kebab-case` | `user-profile/` |
| Services | `*Service` suffix | `userService.js` |
| Booleans | `is` / `has` / `can` / `should` prefix | `isOpen`, `hasError` |
| Functions | verb + noun | `calculateTotal`, `validateEmail` |
| Collections | plural | `users`, `orderItems` |
| Single objects | singular | `user`, `order` |

### 3.2 Client-specific

- **Public env vars** — only framework-approved prefixes (`VITE_`, `NEXT_PUBLIC_`, etc.); never put secrets behind them.
- **Routes** — meaningful, hierarchical URLs (`/orders/:id`), not query-only navigation for primary flows.
- **Analytics events** — `noun_verb` (`checkout_completed`, `signup_started`).
- **i18n keys** — semantic namespaces (`checkout.submitButton`), not raw English sentences as keys.
- **Design tokens** — define in `tailwind.config` / CSS variables; avoid hardcoded hex/px in components.
- **Tailwind** — prefer theme scale; promote repeated arbitrary values to tokens.

### 3.3 Server-specific

- **Controllers** — match existing boilerplate (`userController.js` or `user.controller.js`); handlers use verbs (`createUser`, `getOrderById`).
- **Routes** — plural resources (`/users`, `/orders`); version prefix if used (`/api/v1/users`).
- **Migrations** — `YYYYMMDDHHMMSS_verb_description` (e.g. `20260115120000_add_status_to_orders`).
- **Cache keys** — documented pattern (`user:{id}:profile`).
- **Error codes** — stable string codes in API envelope (`USER_NOT_FOUND`).

### 3.4 Security-sensitive naming

- Name secrets **by purpose**, never embed the value: `STRIPE_SECRET_KEY` ✓ — `apiKey_sk_live_123` ✗
- Variables containing `secret`, `token`, `key`, `password`, `credential` require extra review — never log, commit, or send to client.
- Never write comments like `// prod key is sk_live_...`
- Distinguish **public** vs **private** config in names so misuse is obvious.

### 3.5 Git & branches

- Branches: `feature/<ticket>-short-desc`, `fix/<ticket>-short-desc`, `chore/...`
- Commits: Conventional Commits — `type(scope): message` (`feat(auth): add refresh token rotation`)

**AI directive:** Detect and mirror existing project naming first. If none exists, apply this table consistently. Flag secret-sounding names and any name that embeds a real credential value.

---


## 4. Security Rules

**Scope:** Always apply core rules (secrets, confidentiality, AI safety, scanning). Apply auth/injection/CORS when relevant.

| ID | Rule | Severity |
|----|------|----------|
| SEC-01 | npm / Dependency Scanning | critical |
| SEC-02 | Secrets & Credentials Management | critical |
| SEC-03 | Environment Variable Rules | critical |
| SEC-04 | Never Commit AI-Workspace & Assistant Artifacts | critical |
| SEC-05 | Confidential Code, IP Theft & Leak Prevention | critical |
| SEC-06 | AI-Assisted Development — Confidentiality & Mistake Prevention | critical |
| SEC-07 | Authentication & Authorization | critical |
| SEC-08 | Input Validation & Sanitization | critical |
| SEC-09 | SQL / NoSQL Injection Prevention | critical |
| SEC-10 | Cross-Site Scripting (XSS) Prevention | critical |
| SEC-11 | CSRF Protection | high |
| SEC-12 | Rate Limiting & DDoS Protection | high |
| SEC-13 | CORS Configuration | high |
| SEC-14 | Logging & Audit Trail | high |
| SEC-15 | Encryption & Data at Rest | critical |
| SEC-16 | Third-Party API & Integration Security | high |
| SEC-17 | CI/CD Pipeline Security | critical |
| SEC-18 | Docker & Container Security | high |
| SEC-19 | Deployment Security (Multi-Platform) | critical |
| SEC-20 | Incident Response & Security Monitoring | high |

### SEC-01 — npm / Dependency Scanning

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Prevent known-vulnerable or malicious packages from entering the codebase.

**Rules**
- Run npm audit --audit-level=high (or pnpm/yarn equivalent) on every PR; fail on high/critical.
- Lockfile always committed; CI uses npm ci / frozen lockfile — never npm install.
- New dependencies need a one-line PR justification.
- Dependabot/Renovate for patch/minor with CI; manual review for majors.
- Prefer packages with few transitive deps and active maintenance; avoid libs for <20 LOC trivialities.
- Supply-chain scanning (signatures, Socket, Snyk) beyond CVEs alone.
- Pin exact versions for auth/crypto packages.

**Do**
- Review lockfile diffs in PRs.
- Remove unused dependencies.

**Don't**
- Ignoring audits with --force without review.
- Installing from unverified sources without vetting.
- Auto-merging majors without tests.

**AI directive:** Justify new deps, keep lockfiles, use npm ci, fail CI on high/critical audits, and pin security-sensitive packages.

---

### SEC-02 — Secrets & Credentials Management

> **Severity:** `critical` · **Status:** `complete`

**Summary:** No credential, API key, or token exposed in source, logs, or client bundles.

**Rules**
- Production secrets in a secrets manager / platform env — never committed files.
- env files gitignored; only .env.example with placeholders committed.
- Client-exposed prefixes (VITE_, NEXT_PUBLIC_) are public — never put real secrets behind them.
- Any credential that touches a public channel is compromised — rotate immediately.
- Least-privilege keys.
- CI masks secrets in logs.
- Pre-commit secret scanning (gitleaks/trufflehog).
- Pre-push scanning must also inspect source/bundles for hardcoded client configuration and tracking identifiers. A public identifier may not require rotation like a secret, but it must still be reported as exposed configuration and removed from source-code literals.
- Name env/secrets with SCREAMING_SNAKE by purpose (JWT_SECRET) — never embed real secret values in names or comments.

**Do**
- Rotate on exposure before investigating fully.
- Scope keys per environment.

**Don't**
- Pasting real API keys into chats/tickets/docs.
- Reusing one key across dev/staging/prod.
- Committing .env temporarily (still in history).

**AI directive:** Never emit real secrets. Use env/secrets managers, .env.example placeholders, rotate on any exposure, and keep secrets out of client prefixes.

---

### SEC-03 — Environment Variable Rules

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Standardize how config/secrets flow between environments safely.

**Rules**
- Classify every env var as client-safe or server-only at definition time.
- “Client-safe” means intentionally public, not secured. Record exposure and purpose in the env registry.
- Secret-bearing vars have no hardcoded fallback — fail to start if missing in production.
- Client-safe production identifiers also have no real source-code fallback; use deployment env values and placeholder-only `.env.example` entries.
- Schema-validate required env at startup (zod/envalid).
- Distinct credentials per environment.
- Maintain a registry (docs/env.md) of every var, purpose, and public/secret.
- If a secret is committed, treat as leaked: rotate, then clean history if required.

**Do**
- Fail fast with clear boot errors.
- Keep .env.example in sync.

**Don't**
- Hardcoding temporary fallback secrets that ship to production.
- Hardcoding tracking/project IDs in client config or arrays, including fallback literals after `VITE_*` / `NEXT_PUBLIC_*`.
- Sharing one .env with production credentials across developers.
- Storing env vars in plaintext shared docs.

**AI directive:** Classify env vars, validate at boot, no secret defaults, separate per environment, and document the registry.

---

### SEC-04 — Never Commit AI-Workspace & Assistant Artifacts

> **Severity:** `critical` · **Status:** `complete`

**Summary:** AI/editor workspace files, session caches, and contributor metadata must never reach git — they leak paths, prompts, and sometimes secrets.

**Rules**
- Never commit .cursor/, .claude/, .claude.json, .windsurf/, .aider*, .continue/, or similar AI session/context folders.
- Never commit AI chat exports, prompt logs, agent transcripts, or local rules files meant only for personal use (.cursorrules.local).
- Never commit contributor metadata, session tokens, or AI-generated "contributors" blocks in commit messages.
- Baseline .gitignore must include AI workspace paths before the first commit.
- Personal IDE state (.idea/, local .vscode/*) stays out unless explicitly reviewed as shared team tooling.
- CI must grep every PR diff for disallowed paths (.env, .cursor, .claude, *.pem, *.key) and fail the build.
- Share team AI rules via reviewed files in the repo (e.g. this utils pack) — not by committing local AI caches.

**Do**
- Add AI/editor ignores up front; audit git status before every commit.
- Run a one-time gitleaks/history scan when adopting these rules on an existing repo.
- Keep .env.example and shared rule YAML in git; keep .env and .cursor/ out.

**Don't**
- Committing .cursor/ or .claude/ because it has useful context for teammates.
- Adding a .gitignore exception for one secret or workspace file just this once.
- Assuming .gitignore removes files already tracked — they must be purged from history.

**Example (good)**
```
.env
.env.*
!.env.example
node_modules/
dist/
build/
.next/
.cursor/
.claude/
.windsurf/
*.log
.DS_Store
```

**AI directive:** Never stage or generate commits that include .cursor/, .claude/, session logs, or AI workspace caches. If they appear in a diff, flag them and refuse to commit. Point teammates to reviewed shared rule files instead.

---

### SEC-05 — Confidential Code, IP Theft & Leak Prevention

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Protect proprietary source, business logic, and customer data from leaking via repos, bundles, logs, tickets, screenshots, or public channels — and from theft via weak access controls.

**Rules**
- Treat all proprietary/confidential source as need-to-know — private repos by default; verify remote visibility before every push.
- Never expose internal URLs, infra topology, admin endpoints, or proprietary algorithms in public repos, client bundles, comments, or docs.
- Keep pricing rules, fraud logic, licensing, and security controls server-side — never ship them in frontend code where they can be reverse-engineered.
- Sanitize API errors in production — no stack traces, SQL, file paths, or env details to clients.
- Production source maps are private (error tracker only) or not published — never serve full maps publicly.
- Strip TODO/FIXME comments of internal hostnames, credentials, incident details, or security bypass notes before merge.
- PII minimization — API responses return only fields the client needs; never dump full DB rows.
- No open /debug, /test, or admin-bypass routes in production.
- Protect against code theft: branch protection, least-privilege repo access, revoke access on offboarding, audit bulk exports/clones and long-lived PATs where the platform allows.
- License headers and IP ownership on proprietary files; do not paste client-owned or NDA code into unrelated projects.
- Never post confidential snippets to public Gists, Stack Overflow, Discord, screenshots, or Loom recordings without redaction and approval.

**Do**
- Review every PR diff for internal hostnames, secrets, and confidential comments.
- Use CODEOWNERS or path protections on sensitive directories (auth, billing, infra).
- Time-box contractor/agency repo access; rotate deploy keys they used.
- Confirm git remote is the intended private org before push or PR creation.

**Don't**
- Publishing a private repo to a public remote without a visibility check.
- Logging full request/response bodies on auth or payment endpoints.
- Leaving a client-side isAdmin toggle with no server-side permission check.
- Sharing production DB dumps or full code exports in tickets, email, or chat.
- Assuming "private repo" removes the need to scrub comments and client bundles.

**Example (bad)**
```
// TODO: call internal admin at http://10.0.3.7:9000 with root token
// pricingMultiplier hardcoded in React for 'speed'
```

**Example (good)**
```
// Calls admin service via gateway; credentials from secrets manager
// pricing computed server-side; client receives final price only
```

**AI directive:** Keep confidential and proprietary logic server-side. Never emit internal URLs, credentials, or full proprietary modules into client code, comments, or public examples. Flag any diff that would leak IP or enable code theft (public remotes, missing access controls, exported secrets).

---

### SEC-06 — AI-Assisted Development — Confidentiality & Mistake Prevention

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Prevent accidental confidentiality breaches and IP leaks caused by misuse of AI coding assistants (Cursor, Claude, Copilot, etc.) — pasted secrets, proprietary code in prompts, unreviewed generated output, and mistaken commits.

**Rules**
- Never paste proprietary source, production credentials, customer PII, or internal architecture into public or consumer AI chats without redaction and org approval.
- Use synthetic/sample data in AI prompts — not real user records, API keys, or production connection strings.
- Redact before prompting: replace secrets with placeholders (YOUR_API_KEY), mask hostnames and account IDs.
- Assume cloud AI inputs may be retained or processed per vendor policy — use enterprise/zero-retention tiers for confidential work when available.
- Review all AI-generated code before commit — it may invent plausible secrets, copy GPL code, expose internals in comments, or suggest committing .env/.cursor/.
- AI must refuse to hardcode secrets, commit .env files, or include AI-workspace paths in git — and must warn if the user pasted a real credential.
- Do not upload .env, database dumps, private keys, or full proprietary repos as "context files" to AI tools unless the tool and contract are approved for that data class.
- Never ask AI to push to git without confirming remote visibility (private vs public) and branch name.
- Do not publish AI-generated code snippets containing your internal module names, routes, or schemas to public forums without review.
- If confidential code was pasted into an AI tool in error, treat it as a potential leak: rotate any exposed secrets, notify security per policy, and avoid repeating the paste.

**Do**
- Paste this security pack (or SEC-04/05/06) into AI system prompts so the assistant enforces leak prevention.
- Use .cursorignore / .gitignore to keep secrets and dumps out of AI indexing scope.
- Run secret scanning and human review on AI-heavy PRs the same as any other PR.
- Prefer describing behavior in prompts instead of pasting entire proprietary files.

**Don't**
- Pasting a production .env or Stripe live key into chat to debug faster.
- Blindly accepting AI suggestions that add console.log(process.env) or commit .cursor/.
- Using personal consumer AI accounts for client NDA work without a data-processing agreement.
- Letting AI auto-commit without reviewing the full diff for secrets and workspace files.
- Assuming deleting a message in chat erases it from vendor retention.

**Example (bad)**
```
User: here is our prod .env and full paymentService.ts — refactor it\nAI: commits changes including sk_live_... in a constant
```

**Example (good)**
```
User: refactor payment flow; secrets come from process.env.STRIPE_SECRET_KEY (placeholder)\nAI: server-side only, no secrets in client, flags if user pastes sk_live_
```

**AI directive:** You are a confidentiality-aware assistant. Never request, repeat, or commit real secrets, proprietary client code, or AI-workspace files. Redact sensitive input, refuse unsafe commits, warn on pasted credentials, and keep proprietary logic server-side. If the user shares confidential material, advise redaction and secret rotation — do not amplify it in your response.

---

### SEC-07 — Authentication & Authorization

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Only the right users can access the right resources — enforced server-side every time.

**Rules**
- Server-side authorization always; client route guards are UX only.
- Short-lived access tokens + secure refresh; no long-lived standard sessions.
- Cookies: HttpOnly, Secure, SameSite=Strict or Lax as required.
- Passwords hashed with bcrypt/argon2 + per-user salt.
- Least privilege per-resource; re-verify role on sensitive mutations.
- MFA for admin/staff accounts.
- Rate-limit login/reset/OTP; log repeated failures.
- Logout revokes server-side session/refresh — not only clears client cookie.

**Do**
- Never trust client-sent role/isAdmin.
- Prefer HttpOnly cookies when XSS risk is realistic.

**Don't**
- Trusting role from request body.
- JWTs in localStorage when XSS is a realistic risk without mitigation.
- Same signing secret for access and refresh without rotation capability.

**AI directive:** Enforce server-side authn/authz with short-lived tokens, secure cookies, strong hashing, MFA for privileged accounts, and rate-limited auth endpoints.

---

### SEC-08 — Input Validation & Sanitization

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Treat all external input as untrusted until proven otherwise.

**Rules**
- Validate on the server always with a schema.
- Whitelist allowed type/length/format/range — not blacklist-only.
- Explicit type coercion for security checks (===, typed IDs).
- File uploads: content sniffing, size limits, malware scan where accepted.
- Reject early at API boundary with generic 4xx before business logic.
- Sanitize user HTML (DOMPurify) before render.
- Normalize emails/usernames before compare.

**Do**
- Share schemas with FE where possible.
- Reject unknown fields.

**Don't**
- Trusting client already validated flags.
- Regex-only blacklist for XSS/SQLi instead of parameterization + encoding.
- Arbitrary uploads without size/type limits.

**AI directive:** Server-side whitelist schema validation, early reject, sanitize HTML, normalize identifiers, and constrain uploads.

---

### SEC-09 — SQL / NoSQL Injection Prevention

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Database queries can never be manipulated by user input.

**Rules**
- Parameterized queries / ORM only — never string-concat user input into SQL.
- Raw query escape hatches require review and still use parameter binding.
- Strip/reject Mongo operator keys ($where, $gt, $ne) from user input unless explicitly validated.
- App DB user least privilege (no DROP/ALTER for standard service account).
- Validate/coerce ID/date/enum types before query.
- Never build dynamic table/column names from unvalidated user input.

**Do**
- Prefer query builders/ORM.
- Allowlist sort/filter fields.

**Don't**
- Template-string SQL with user input.
- Passing raw req.body into Mongo filters.
- Disabling ORM escaping for performance.

**AI directive:** Use parameterized queries only. Guard NoSQL operators. Least-privilege DB users. Never interpolate user input into SQL or dynamic identifiers.

---

### SEC-10 — Cross-Site Scripting (XSS) Prevention

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Prevent attacker-controlled scripts from executing in another user's browser session.

**Rules**
- Rely on framework auto-escaping (React JSX) by default.
- Sanitize before dangerouslySetInnerHTML / v-html with explicit allowlists.
- Ship strict CSP (script-src self; avoid unsafe-inline/eval where possible).
- Escape output contextually for HTML/URL/JS/CSS.
- Validate user URLs against http/https scheme allowlist — block javascript: URIs.
- Isolate untrusted third-party widgets in sandboxed iframes.

**Do**
- Prefer text children over raw HTML.
- Tighten CSP iteratively.

**Don't**
- dangerouslySetInnerHTML with unsanitized input.
- Concatenating user input into href/src without validation.
- Disabling CSP broadly to fix script loading.

**AI directive:** Keep auto-escaping on, sanitize any raw HTML path, enforce CSP, validate URLs, and sandbox untrusted embeds.

---

### SEC-11 — CSRF Protection

> **Severity:** `high` · **Status:** `complete`

**Summary:** Prevent malicious sites from triggering unwanted authenticated actions.

**Rules**
- CSRF tokens on state-changing requests for cookie-authenticated sessions.
- SameSite=Lax or Strict as baseline.
- Use well-tested CSRF middleware (synchronizer or double-submit).
- For Bearer APIs, require custom headers as additional mitigation where applicable.
- Step-up re-auth for password change, payment updates, account deletion.
- Never use GET for state-changing actions.

**Do**
- Document CSRF model for pure Bearer APIs.
- Combine SameSite + tokens for cookie sessions.

**Don't**
- Referer header alone as CSRF protection.
- Exempting convenience routes without review.
- Destructive GET links.

**AI directive:** Protect cookie-authenticated state changes with CSRF tokens and SameSite cookies. Re-auth for high-risk actions. No state-changing GETs.

---

### SEC-12 — Rate Limiting & DDoS Protection

> **Severity:** `high` · **Status:** `complete`

**Summary:** Protect the application from abuse, brute force, and overload.

**Rules**
- Global + stricter limits; stricter on login/reset/OTP/checkout.
- Edge protection (Cloudflare/WAF/Shield) in front of the app.
- Proven algorithm + shared store (Redis) for multi-instance.
- Return 429 with Retry-After.
- Account lockout with backoff + alerting after repeated failures.
- Tighter limits on expensive compute/email endpoints.

**Do**
- Combine IP with user/session identifiers where possible.
- Alert on sustained abuse.

**Don't**
- App-layer-only limiting with no edge protection.
- IP-only limits causing NAT false positives without mitigation.
- Unlimited password-reset/OTP endpoints.

**AI directive:** Apply layered rate limits and edge DDoS protection. Return 429 with Retry-After. Lock out abusive auth attempts.

---

### SEC-13 — CORS Configuration

> **Severity:** `high` · **Status:** `complete`

**Summary:** Control exactly which origins can call the API from a browser.

**Rules**
- Explicit origin allowlist per environment — never * for authenticated/cookie APIs.
- Never combine wildcard origin with credentials true.
- Minimal allowed methods/headers.
- Environment-specific allowlists — staging domains not trusted in production.
- Reasonable Access-Control-Max-Age for preflight caching.

**Do**
- Read allowlist from env.
- Fail closed on unexpected Origin for credentialed APIs.

**Don't**
- Access-Control-Allow-Origin * on authenticated APIs.
- Reflecting Origin unconditionally.
- Leaving wildcard/dev CORS in production.

**AI directive:** Configure explicit CORS allowlists from env. Never pair wildcard origin with credentials. Keep methods/headers minimal.

---

### SEC-14 — Logging & Audit Trail

> **Severity:** `high` · **Status:** `complete`

**Summary:** Traceability for security events without exposing sensitive data.

**Rules**
- Structured JSON logs with timestamp, level, service, requestId, userId where safe.
- Separate append-only audit log for logins, permission changes, exports, admin actions, failed auth.
- Redact passwords/tokens/card numbers at the logging-library level.
- Correlation IDs across logs and downstream calls.
- Retention policy + access-controlled production logs.
- Review third-party log sinks for PII/secret leakage before enabling.

**Do**
- Log security-meaningful events.
- Audit who can read production logs.

**Don't**
- Logging full bodies for password/token/payment endpoints.
- console.log as the production logging pipeline.
- Broad log access without justification.

**AI directive:** Use structured logs with redaction, correlation IDs, and a separate security audit trail. Control log access and sinks.

---

### SEC-15 — Encryption & Data at Rest

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Protect stored data even if underlying storage is compromised.

**Rules**
- Encrypt sensitive fields at rest (app or DB level).
- TLS everywhere in transit — including service↔DB in production.
- Keys via KMS/Vault with rotation — never hardcoded or stored beside ciphertext.
- Backups encrypted too.
- Field-level encryption for high-risk fields (SSN, etc.).
- Prefer tokenization (Stripe) over storing raw payment data.

**Do**
- Enforce HTTPS redirects.
- Minimize stored sensitive data.

**Don't**
- Storing raw card numbers.
- Disk encryption alone for highly sensitive fields.
- Keys in the same table as encrypted data.

**AI directive:** TLS everywhere, encrypt sensitive data and backups, manage keys via KMS, and prefer tokenization over storing raw payment data.

---

### SEC-16 — Third-Party API & Integration Security

> **Severity:** `high` · **Status:** `complete`

**Summary:** Ensure external integrations do not become the weakest link.

**Rules**
- Secret-key third-party calls from the server only — never embedded client keys.
- Verify webhook signatures/HMAC before processing.
- Timeouts and circuit breakers on outbound calls.
- Least-privilege OAuth scopes.
- Documented owner + rotation plan per vendor credential.
- Validate third-party response shapes before use.

**Do**
- Proxy sensitive SDKs through backend.
- Sandbox credentials in non-prod.

**Don't**
- Embedding payment secret keys in client code.
- Processing unsigned webhooks.
- Granting full admin scopes when read-only suffices.

**AI directive:** Call secret APIs from the server, verify webhooks, set timeouts/circuit breakers, minimize scopes, and validate vendor responses.

---

### SEC-17 — CI/CD Pipeline Security

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Keep the build/deploy pipeline itself from becoming an attack vector.

**Rules**
- Least-privilege CI secrets scoped per pipeline/environment.
- Production deploys only from protected branches after reviews + checks.
- No secrets inline in pipeline YAML — reference the secret store.
- Build once, sign/checksum, promote immutable artifacts.
- SAST + dependency scanning as required blocking steps.
- Mirror the applicable test/security gate locally in a pre-push hook so failures are visible and fixable before code leaves the workstation.
- Fork PRs never get production secrets by default.
- CI config changes go through the same PR review as app code.

**Do**
- Prefer OIDC short-lived cloud creds.
- Mask secrets in logs.

**Don't**
- Root/admin cloud keys as CI secrets.
- Fork PRs with production secret access.
- Skipping security scans to speed up the pipeline.
- Treating remote CI as the first time tests or mandatory security scans run.

**AI directive:** Scope CI secrets, protect production deploys, require local pre-push tests/security scans plus remote CI, promote immutable artifacts, and never expose secrets to fork PRs.

---

### SEC-18 — Docker & Container Security

> **Severity:** `high` · **Status:** `complete`

**Summary:** Keep container images and runtime configuration hardened.

**Rules**
- Minimal base images (slim/distroless/alpine).
- Non-root USER.
- Multi-stage builds so build tools/secrets never hit final image.
- No .env or secrets copied into image layers — inject at runtime.
- Scan images (Trivy/Grype) in CI; block critical vulns.
- Pin base tags/digests — not latest.
- Set CPU/memory limits.

**Do**
- npm ci in build stage with lockfile.
- Use .dockerignore for secrets/.git.

**Don't**
- FROM node:latest in production.
- Running as root.
- COPY .env into the image.

**AI directive:** Generate multi-stage non-root pinned Dockerfiles with no baked secrets, image scanning, and resource limits.

---

### SEC-19 — Deployment Security (Multi-Platform)

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Consistent hardening across AWS EC2, DigitalOcean, Vercel, cPanel, Railway, and Render.

**Rules**
- Secrets via platform env/secret store — never committed files.
- HTTPS enforced; HTTP redirected.
- Least-privilege deploy credentials scoped to the project/service.
- Separate prod/staging/preview DBs and credentials completely.
- EC2: IAM roles not long-lived keys; tight security groups; key-based SSH; patched OS.
- DigitalOcean: firewalls; backups; managed DB on private networking.
- Vercel: mark Sensitive env vars; separate Preview vs Production scope; use edge protections.
- cPanel: disable unused services; current software; SFTP not FTP; no chmod 777; 2FA on account.
- Railway: project-scoped tokens; private networking; resource limits.
- Render: environment groups; auto-deploy from protected branches; private services for internals.

**Do**
- Never expose databases to the public internet.
- Never share prod secrets with preview/staging.

**Don't**
- Password SSH as shared root on EC2.
- Public DB for convenience.
- Same API keys across production and preview.

**AI directive:** Enforce HTTPS, platform secrets, least-privilege deploy creds, and fully separate environments. Apply the platform-specific hardening notes for the target host.

---

### SEC-20 — Incident Response & Security Monitoring

> **Severity:** `high` · **Status:** `complete`

**Summary:** Detect issues quickly and respond in a structured, repeatable way.

**Rules**
- Centralized alerts for failed-login spikes, unusual admin activity, error spikes.
- Written incident runbook: who to notify, how to rotate, how to communicate, how to post-mortem.
- Rotate first on suspected compromise — do not wait for confirmation.
- Blameless post-mortems focused on system fixes.
- Uptime/APM monitoring for anomalies.
- Regular access reviews; revoke on offboarding immediately.
- Periodically test backup restores.

**Do**
- Keep runbooks short and actionable.
- Document RPO/RTO with backups.

**Don't**
- Rotating leaked credentials days later after confirmation.
- Leaving former contributors with prod access.
- No documented incident process.

**AI directive:** Alert on security anomalies, rotate credentials immediately on suspicion, maintain runbooks and blameless post-mortems, review access, and test restores.

---

## 5. DevOps Rules

**Scope:** Apply only when the project deploys or has CI/CD. Pick the platform playbook that matches (EC2, Vercel, Railway, etc.).

| ID | Rule | Severity |
|----|------|----------|
| OPS-01 | CI/CD Pipeline Principles | high |
| OPS-02 | Secrets & Env Vars In Pipelines | critical |
| OPS-03 | AWS EC2 Deployment | high |
| OPS-04 | DigitalOcean Deployment | high |
| OPS-05 | Vercel Deployment | high |
| OPS-06 | cPanel Deployment | medium |
| OPS-07 | Railway Deployment | high |
| OPS-08 | Render Deployment | high |
| OPS-09 | Docker Containerization | high |
| OPS-10 | GitHub Actions Workflow Standards | high |
| OPS-11 | Build & Artifact Management | medium |
| OPS-12 | Zero-Downtime Deployment | high |
| OPS-13 | Rollback & Recovery | high |
| OPS-14 | Infrastructure as Code | medium |
| OPS-15 | Nginx Reverse Proxy & SSL | high |
| OPS-16 | Process Management (PM2 / systemd) | medium |
| OPS-17 | Database Migrations In Pipeline | high |
| OPS-18 | Monitoring & Alerting | medium |
| OPS-19 | Logging & Log Rotation | medium |
| OPS-20 | Backup & Disaster Recovery | high |

### OPS-01 — CI/CD Pipeline Principles

> **Severity:** `high` · **Status:** `complete`

**Summary:** Every deploy flows through an automated, reproducible pipeline. Lint + tests + build must pass before deploy.

**Rules**
- Pipelines reproducible with locked deps (npm ci) locally and in CI.
- Fail fast: lint → test → build → scan → deploy.
- Deploy only from protected branch/tag — never arbitrary branches or fork PRs.
- Separate environments with promotion between them.
- Pipeline-as-code lives in the repo.
- Production deploys do not bypass code review.

**Do**
- Gate production behind passing checks and optional manual approval.
- Keep workflow YAML free of inline secrets.

**Don't**
- SSH in and hand-restart production.
- Skipping tests/audits to just ship it.
- Deploying from unreviewed forks.

**AI directive:** Generate fail-fast pipelines (lint/test/build/scan/deploy) that deploy only from protected refs after review.

---

### OPS-02 — Secrets & Env Vars In Pipelines

> **Severity:** `critical` · **Status:** `complete`

**Summary:** Pipeline secrets come from the CI secret store — never committed files or plaintext YAML.

**Rules**
- Store secrets in GitHub Actions secrets (or equivalent).
- Inject as masked env at the step that needs them; never echo/log.
- Least-privilege deploy credentials scoped to target + environment.
- Prefer OIDC / short-lived cloud credentials.
- Never commit .env, SA JSON, or SSH keys.

**Do**
- Rotate deploy keys.
- Mask secrets in CI logs.

**Don't**
- Hardcoding tokens in workflow YAML.
- One all-powerful credential across every environment.
- Fork PRs with access to production secrets.

**AI directive:** Source all pipeline secrets from the encrypted store, mask them, scope least privilege, and prefer short-lived OIDC creds.

---

### OPS-03 — AWS EC2 Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Deploy to EC2 via CI/SSH with reverse proxy, process manager, and zero-downtime reload.

**Rules**
- Hardened security group (SSH from trusted IPs only; 80/443 public).
- Nginx reverse proxy + TLS; app via PM2/systemd.
- CI over SSH with scoped deploy key; build then reload.
- Zero-downtime restart (pm2 reload).
- Secrets in SSM/Secrets Manager — not plaintext on disk.
- Dedicated deploy user — not root.
- IAM roles on instance — not long-lived access keys when avoidable.

**Do**
- See devops/pipelines/deploy-ec2.yml.
- Redirect HTTP to HTTPS.

**Don't**
- Open SSH to 0.0.0.0/0.
- Password SSH / shared root.
- git pull and hand-restart with downtime.

**AI directive:** Generate EC2 deploys with hardened SG, Nginx+TLS, PM2 reload, CI-over-SSH with scoped keys, and IAM roles where possible.

---

### OPS-04 — DigitalOcean Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Deploy Droplet (Nginx+PM2) or App Platform (git) with managed TLS and private DB networking.

**Rules**
- Droplet: mirror EC2 playbook (ufw, Nginx, TLS, PM2).
- App Platform: connect repo, env in dashboard, auto-deploy from protected branch.
- Managed DB on private networking — never public.
- Enable backups/snapshots.
- Scope DO tokens to minimum needed.

**Do**
- See devops/pipelines/deploy-digitalocean.yml.
- Separate staging/production projects.

**Don't**
- Exposing databases publicly.
- Manual file edits on Droplet without a pipeline.
- Committing DO tokens.

**AI directive:** For Droplets use EC2-style hardening; for App Platform use git deploy with dashboard env vars, TLS, and private DB networking.

---

### OPS-05 — Vercel Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Git-based Vercel deploys with preview environments and correctly scoped env vars.

**Rules**
- PRs get preview deploys; main maps to production.
- Env vars scoped Development/Preview/Production separately.
- Only public-prefixed vars reach the browser.
- Mark sensitive vars as Sensitive in Vercel.
- Explicit build/output/framework settings; vercel.json for headers/rewrites when needed.
- Never commit .vercel/ tokens.

**Do**
- See devops/pipelines/deploy-vercel.yml.
- Use edge/DDoS protections.

**Don't**
- Server secrets in NEXT_PUBLIC_/VITE_ vars.
- Same secrets in Preview and Production.
- Committing Vercel tokens.

**AI directive:** Use Vercel git deploys with per-environment Sensitive vars, browser-safe public prefixes only, and explicit build/headers config.

---

### OPS-06 — cPanel Deployment

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Deploy via Git or CI SFTP/SSH using Node App or public_html correctly — never plain FTP for secrets.

**Rules**
- Use Setup Node.js App for Node; static builds to public_html/docroot.
- Deploy via Git Version Control or CI SFTP/SSH.
- Env vars in Node App UI — not committed files.
- Always SFTP (or SSH key) — never plain FTP.
- Disable directory listing; block public .env and VCS metadata.
- No chmod 777; keep software current; 2FA on cPanel account.

**Do**
- See devops/pipelines/deploy-cpanel.yml.
- Build in CI; sync only required output.

**Don't**
- Uploading .env or node_modules via FTP.
- Leaving source maps/backups publicly downloadable.
- World-writable permissions.

**AI directive:** Build in CI, deploy via SFTP/Git to docroot or Node App with UI env vars. Never FTP secrets. Prefer SSH keys over passwords.

---

### OPS-07 — Railway Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Git/CLI deploy on Railway with service variables, private networking, and health checks.

**Rules**
- Build via Nixpacks/Dockerfile; bind to process.env.PORT.
- Variables per service/environment in dashboard — not in code.
- Managed DB via injected connection vars on private networking.
- Define start + health check.
- Project-scoped tokens; resource limits per service.

**Do**
- See devops/pipelines/deploy-railway.yml.
- Separate staging/production environments.

**Don't**
- Hardcoding DB URL or fixed ports.
- Exposing internal services publicly.
- Committing Railway tokens.

**AI directive:** Bind to PORT, read Railway service variables, use private networking for internals, and define health checks.

---

### OPS-08 — Render Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Git auto-deploy on Render with health checks, env groups, and managed databases.

**Rules**
- render.yaml blueprint or dashboard service; auto-deploy from protected branch only.
- Bind to process.env.PORT; health check path required.
- Env Groups for shared config; managed Postgres/Redis connection strings.
- Private services for internal-only components.
- Treat deploy hook URLs as secrets.

**Do**
- See devops/pipelines/deploy-render.yml.
- Enable zero-downtime where plan supports.

**Don't**
- Hardcoding ports/URLs.
- Skipping health checks.
- Duplicating env vars instead of Env Groups.

**AI directive:** Use render.yaml git auto-deploy, bind to PORT, configure env groups + health checks, and keep internals private.

---

### OPS-09 — Docker Containerization

> **Severity:** `high` · **Status:** `complete`

**Summary:** Reproducible, small, secure images with no secrets in layers.

**Rules**
- Multi-stage builds; slim/distroless bases.
- Non-root user; pin digests/tags (not latest).
- dockerignore excludes .env/.git/secrets.
- Inject secrets at runtime.
- Scan images in CI; set CPU/memory limits.

**Do**
- Copy lockfiles early; npm ci for deterministic installs.

**Don't**
- Baking secrets into layers.
- Running as root.
- FROM *:latest in production.

**AI directive:** Generate multi-stage non-root pinned Dockerfiles with .dockerignore, runtime secrets, and image scanning.

---

### OPS-10 — GitHub Actions Workflow Standards

> **Severity:** `high` · **Status:** `complete`

**Summary:** Consistent, secure, cached Actions workflows with least-privilege permissions.

**Rules**
- Pin actions to version tags or commit SHAs — never @master.
- Least-privilege permissions block — avoid write-all.
- Cache deps; use npm ci.
- Split jobs with clear needs; protect production environments.
- Prefer OIDC to long-lived cloud keys.

**Do**
- Review third-party actions before use.
- Keep secrets masked.

**Don't**
- @master action refs.
- contents: write when only read needed.
- echo secrets for debugging.

**AI directive:** Pin action versions, cache deps, declare least-privilege permissions, and prefer OIDC. Never use @master or write-all casually.

---

### OPS-11 — Build & Artifact Management

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Build once and promote the same artifact across environments to avoid drift.

**Rules**
- Versioned artifact/image per commit/tag.
- Promote identical build staging→prod.
- Store in registry with access controls.
- Record git SHA in runtime metadata.
- Do not commit dist/build to git.

**Do**
- Tag images with git SHA.
- Fail if artifact missing/checksum mismatch.

**Don't**
- Rebuilding separately per environment.
- Deploying untagged latest without traceability.
- Committing build artifacts.

**AI directive:** Build a single versioned artifact, embed git SHA, and promote that same artifact across environments.

---

### OPS-12 — Zero-Downtime Deployment

> **Severity:** `high` · **Status:** `complete`

**Summary:** Release without dropping requests via rolling/blue-green + health checks + graceful shutdown.

**Rules**
- Prefer rolling/blue-green over stop-then-start.
- Gate traffic on health/readiness.
- Handle SIGTERM and drain connections.
- Keep migrations backward-compatible during rolling updates.

**Do**
- pm2 reload / platform rolling deploys.
- Expose /health and optionally /ready.

**Don't**
- Killing the only production process hoping restart is fast.
- Breaking migrations mid-rollout.
- Ignoring SIGTERM.

**AI directive:** Design rolling/blue-green deploys with health checks and graceful shutdown. Keep migrations backward-compatible during rollout.

---

### OPS-13 — Rollback & Recovery

> **Severity:** `high` · **Status:** `complete`

**Summary:** Every deploy is quickly reversible to a known-good prior release.

**Rules**
- Retain previous artifact/image/release.
- One-command/one-click rollback documented for on-call.
- Coordinate app rollback with DB compatibility.
- Test rollback periodically.

**Do**
- Tag releases unambiguously.
- Automate rollback in the same tooling.

**Don't**
- Deploy with no retained prior artifact.
- Rebuilding from memory of what changed.
- Irreversible data deletes without backups.

**AI directive:** Retain prior artifacts and document a tested one-command rollback for every production deploy.

---

### OPS-14 — Infrastructure as Code

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Provision infra declaratively, version it, and review via PRs.

**Rules**
- Prefer Terraform/Pulumi/CloudFormation/platform blueprints over undocumented click-ops.
- Review infra changes via PRs.
- Secure remote state with locking — never commit secret-bearing state.
- Keep environments reproducible from IaC.

**Do**
- Plan before apply in CI.
- Least-privilege IAM in definitions.

**Don't**
- Critical prod changes only in console with no record.
- Committing terraform.tfstate with secrets.
- Undocumented manual tweaks on top of IaC.

**AI directive:** Prefer declarative IaC in git with PR review, secured remote state, and reproducible environments.

---

### OPS-15 — Nginx Reverse Proxy & SSL

> **Severity:** `high` · **Status:** `complete`

**Summary:** Terminate TLS and reverse-proxy securely to the app.

**Rules**
- Proxy to internal app port; do not expose app port publicly when proxy exists.
- Auto-renew TLS (Let's Encrypt/ACM).
- Redirect HTTP to HTTPS.
- Set security headers at proxy or app.
- Sensible timeouts and client body limits.

**Do**
- HTTP/2 where supported.
- Upstream health checks when available.

**Don't**
- Leaving port 3000 open to the world.
- Expired self-signed certs on public prod.
- Mixed content (HTTPS page calling HTTP APIs).

**AI directive:** Generate Nginx that proxies to the app, enforces auto-renewed TLS, redirects HTTP to HTTPS, and keeps the app port private.

---

### OPS-16 — Process Management (PM2 / systemd)

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Keep the app running under a supervisor with autorestart, logs, and start-on-boot.

**Rules**
- Run under PM2 or systemd — not a bare SSH shell.
- Autorestart on crash; enable start on boot.
- Capture logs with rotation.
- Prefer reload over hard restart when possible.
- Commit ecosystem.config / unit file as source of truth.

**Do**
- Set NODE_ENV via supervisor.
- Do not run as root without justification.

**Don't**
- node server.js in screen/tmux as production.
- Disabling restart-on-failure permanently.

**AI directive:** Run services under PM2/systemd with autorestart, rotated logs, and start-on-boot. Prefer reload for zero-downtime.

---

### OPS-17 — Database Migrations In Pipeline

> **Severity:** `high` · **Status:** `complete`

**Summary:** Run migrations as a gated, reversible pipeline step — not on every boot.

**Rules**
- Explicit gated migrate step in deploy pipelines.
- Backward-compatible expand/contract during rolling deploys.
- Keep down migrations when safe.
- Never auto-run destructive migrations on app boot in production.
- Verify backups before risky migrations.

**Do**
- Fail deploy if migrate fails.
- Separate expand and contract across releases.

**Don't**
- Dropping columns still read by old instances mid-rollout.
- migrate on every pod start (races).
- Unreviewed hand SQL on production.

**AI directive:** Run migrations as a gated, backward-compatible pipeline step with rollback awareness. Never destructive boot-time migrations.

---

### OPS-18 — Monitoring & Alerting

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Observe health and get alerted on downtime, errors, and saturation.

**Rules**
- External uptime checks on health endpoints.
- Track error rate, latency, CPU/memory/disk.
- Actionable alerts with owners/runbooks.
- Wire error tracking without logging secrets.
- Include deploy markers to correlate releases with incidents.

**Do**
- Define light SLOs for availability/latency.
- Alert on sustained 5xx and failed health checks.

**Don't**
- Deploy with zero visibility.
- Noisy alerts nobody acts on.
- Discovering outages only from user complaints.

**AI directive:** Include health checks, metrics/error monitoring, deploy markers, and actionable alerts for every production service.

---

### OPS-19 — Logging & Log Rotation

> **Severity:** `medium` · **Status:** `complete`

**Summary:** Centralize structured logs and rotate local logs so disks do not fill.

**Rules**
- Structured app logs shipped to a central store when available.
- Rotate/size-limit local logs (logrotate/PM2).
- Redact secrets/PII.
- Retain per policy; monitor disk on VPS hosts.
- Include request IDs for correlation.

**Do**
- Set explicit retention.
- Avoid SSH-and-tail as sole observability.

**Don't**
- Unbounded logs filling root volume.
- Logging credentials/tokens.
- No centralization for multi-instance fleets.

**AI directive:** Centralize structured logs, rotate local files, monitor disk, and never log secrets.

---

### OPS-20 — Backup & Disaster Recovery

> **Severity:** `high` · **Status:** `complete`

**Summary:** Automate off-site backups, test restores, and document RPO/RTO.

**Rules**
- Scheduled automated DB/file backups.
- Store off-site in a separate failure domain.
- Encrypt backups; restrict restore permissions.
- Periodically test restores.
- Document RPO/RTO and keep a short restore runbook.
- Alert on backup failures.

**Do**
- Use managed backup features when available.
- Verify success monitoring.

**Don't**
- Assuming the platform backs everything up without verification.
- Only on-disk snapshots on the same server.
- Never testing a restore until an emergency.

**AI directive:** Automate encrypted off-site backups, alert on failures, periodically test restores, and document RPO/RTO.

---

## 6. Security Scan Checklist

Run the scans that apply to your project. The applicable test/security suite must run **locally before every push**, then run again in CI. Failed tests and **critical/high** findings block push/merge/deploy unless explicitly waived with documented emergency approval.

### 6.1 Pre-commit (local)

| Check | Command / tool | Blocks commit when |
|-------|----------------|-------------------|
| Secret scan | `gitleaks detect --source .` | Keys, tokens, PEMs found |
| Lint & format | `npm run lint` / `lint-staged` | Lint errors |
| Typecheck | `npm run typecheck` / `tsc --noEmit` | Type errors |
| Staged path guard | custom script or `git diff --cached` | `.env`, `.cursor/`, `.claude/`, `*.pem` staged |

### 6.2 Pre-push gate (local, mandatory)

Wire a tracked pre-push script/hook (for example Husky, Lefthook, pre-commit framework, or the repository’s task runner). It must show results locally before `git push` contacts the remote.

| Check | Command / tool | Blocks push when |
|-------|----------------|------------------|
| Tests | project test command (e.g. `npm test -- --run`) | Any required test fails |
| Lint & typecheck | `npm run lint` + `npm run typecheck` | Errors |
| Dependency audit | `npm audit --audit-level=high` (or ecosystem equivalent) | High/critical vulnerability |
| Secret scan | `gitleaks detect --source .` (or approved equivalent) | Credential/key material found |
| Client exposure scan | SAST/custom patterns + production build inspection | Hardcoded tracking IDs, public-config fallbacks, secret-like values, or internal endpoints found |
| Build | project build command, when configured | Build fails |

- Fix failures locally, rerun the complete gate, then push.
- Do not use `git push --no-verify` to skip the gate except under documented emergency approval.
- CI remains mandatory; a local pass does not replace protected-branch checks.

### 6.3 Dependency & supply chain (every Node project)

| Check | Command | Fail on |
|-------|---------|---------|
| npm audit | `npm audit --audit-level=high` | High/critical CVEs |
| Lockfile integrity | `npm ci` (not `npm install` in CI) | Lockfile out of sync |
| Lockfile review | PR diff on `package-lock.json` | Unexpected new packages |
| Optional | Socket.dev, Snyk, Dependabot | Policy violations |

### 6.4 Static analysis & code quality (CI)

| Check | When | Notes |
|-------|------|-------|
| Unit / integration tests | Every PR | Required gate |
| Coverage floor | CI threshold on `services/`, `hooks/`, `utils/` | e.g. ≥ 70% where configured |
| SAST | CI pipeline | Semgrep, CodeQL, or org standard |
| Dockerfile scan | If using Docker | Trivy, Grype — block critical |

### 6.5 Security rules spot-check (AI or human review)

| Area | What to verify |
|------|----------------|
| SEC-02 / SEC-03 | No hardcoded secrets; `.env` gitignored; `.env.example` present |
| Client config exposure | No literal tracking/project IDs or real `VITE_*` / `NEXT_PUBLIC_*` fallback values; public IDs are documented as exposed |
| SEC-04 / SEC-06 | No `.cursor/`, `.claude/`, session logs in diff |
| SEC-05 | No proprietary logic in client bundle; no internal URLs in comments |
| SEC-08–10 | Server validation; parameterized queries; no unsafe `dangerouslySetInnerHTML` |
| SEC-11–13 | CSRF for cookie sessions; rate limits on auth; CORS allowlist |
| Client CS-16 / CS-19 | No secrets in `VITE_` / `NEXT_PUBLIC_`; no hardcoded analytics IDs/fallbacks; tracking is consent-gated |

### 6.6 Pre-deploy (when DevOps applies)

| Check | Notes |
|-------|-------|
| All CI jobs green | lint, test, build, scan |
| Secrets from platform store | not in repo or workflow YAML |
| HTTPS enforced | TLS certs valid |
| Migrations gated | backward-compatible for rolling deploy |
| Health check configured | `/health` or platform equivalent |
| Backup verified | for production data stores |

### 6.7 AI compliance report

After significant code generation or review, output the **Compliance Report** defined in [README.md](README.md#compliance-report-template). Mark each category `PASS`, `WARN`, `FAIL`, or `N/A` with a one-line note.

**AI directive:** Before any requested push, run and report the applicable local pre-push test/security gate; fix blocking failures before pushing. At the end of implementation or security review tasks, produce the compliance report. Never mark `PASS` for a category you did not evaluate.

---




Security-first setup (every project)

Copy this file into any repo (for example as SECURITY-FIRST.md) or paste it into Cursor rules. It is self-contained: follow it on every new project, clone, first open, GitHub pull, and before any install.



Mandatory order of operations

On every new project / clone / first open / pull / before any package work:

Step 1 — Malware / security scan (do this first)

Before any install, build, start, npx, lifecycle script, or package-manager work:





Scan the tree (skip node_modules and .git objects).



Check all October 2026 malware markers below.



If any marker is found:





Remove the malicious files (do not execute them).



Stop.



Do not install packages.



Do not commit.



Do not push.



Tell the user the paths removed.



If the scan is clean: say so, then go to Step 2.



October 2026 markers (check all)







Marker



Action





.vscode/tasks.json uses runOn folderOpen, or runs node on a .eot / .woff / .woff2 / .ttf file



Delete that tasks.json. Do not run the task.





.vscode/settings.json has task.allowAutomaticTasks true



Set it to off (user setting stays off).





Font files named fa-solid-* (.eot, .woff, .woff2) under paths like public/fonts



Read only the first bytes. A real woff2 starts with wOF2. A real eot is binary (~200KB). If the file is JavaScript (function, global, or _0x), delete it and do not execute it. If nothing in the repo references that file, delete the unused copy too.





package.json / lockfile lifecycle scripts (preinstall, install, postinstall, prepare)



Stop if a script starts with node api.js &&, or downloads and runs remote code with curl, wget, or eval.





api.js prepended onto npm start (or similar) scripts



Treat as malicious; remove; do not execute.





api.js, tailwind.config.js, postcss.config.js / .mjs



If obfuscated code sits after a long run of spaces, delete that payload and do not run it.





.git/hooks other than *.sample



Remove any hook that downloads code or runs node on a non-script file.

Hard rules during scan





Never run node on .eot, .woff, .woff2, .ttf, or other non-script files.



Never execute suspicious payloads “to inspect” them.



Prefer the user’s security scan scripts when available; do not invent new install steps before the scan is clean.



Runnable .sh / .cmd copies of those tools live in [../scripts/](../scripts/) (see that folder’s README for run commands).



Step 2 — Read-only dependency analysis (only after a clean scan)

Before any node_modules install, uninstall, update, or migration:





Run the full read-only dependency cleanup prompt in the section below.



Produce the full report sections.



Confirm zero installs, removals, updates, source changes, lockfile changes, and app executions.



STOP after the report.



Wait for the user’s explicit approval in that thread before any migration or install.



“Just install” without prior approval

If the user asks to “just install” (or similar) without approving a prior read-only report in that same thread: run the read-only analysis first and stop. Do not install.





No GitHub operations (user owns GitHub)

The agent must never:





git push in any form (including --force, --force-with-lease, --mirror, --tags)



gh auth login, store GitHub tokens, or write SSH keys for publish



Create or update pull requests, remote branches, tags, or releases



Any remote publish / GitHub write

The user handles all GitHub operations. Local analysis and reports only. When local work is done, tell the user the local result is ready and stop.





Full read-only dependency cleanup prompt (use verbatim)

Use this prompt when working on any new project or before installing node modules.

Please Use this prompt while working on any new project or or installing node module


We need to perform a dependency cleanup and migration in this MERN project.

This task is limited to normal software dependency maintenance.

## IMPORTANT — READ ONLY

For this task, DO NOT make any changes.

Do not:

* install packages
* uninstall packages
* update packages
* run npm install
* run npm ci
* run npm update
* run npm audit fix
* run yarn install
* run pnpm install
* run npx
* execute package binaries
* execute lifecycle scripts
* start the application
* run builds
* run tests
* modify package.json
* modify package-lock.json
* modify yarn.lock
* modify pnpm-lock.yaml
* delete node_modules

Only inspect existing project files and produce a migration report.

## TASK

Analyze the project's dependency configuration.

Inspect:

* package.json
* package-lock.json
* yarn.lock
* pnpm-lock.yaml
* npm-shrinkwrap.json
* .npmrc
* workspace configuration
* existing source imports

Only inspect files that exist.

## 1. Dependency inventory

Create a complete inventory of:

* dependencies
* devDependencies
* optionalDependencies
* peerDependencies
* workspace dependencies

Record package names and versions.

## 2. Dependency consistency

Compare package.json with the existing lockfile and node_modules.

Identify:

* version mismatches
* duplicate versions
* unused dependencies
* missing dependencies
* packages referenced by source code but not declared
* packages declared but apparently unused

## 3. Package replacement candidates

Identify dependencies that should reasonably be replaced because they are:

* obsolete
* unmaintained
* redundant
* unnecessarily heavy
* incompatible with the current project
* poor choices for the current architecture

Do not install replacements.

## 4. Replacement recommendations

For every package that should be replaced, provide:

| Existing Package | Version | Replacement | Reason | Migration Difficulty |
| ---------------- | ------- | ----------- | ------ | -------------------- |

Only recommend established alternatives.

## 5. Source-code impact

For each replacement candidate, search the source code and identify:

* import statements
* require statements
* configuration
* API usage
* affected files
* expected code changes

Do not modify those files.

## 6. Migration sequence

Create a future migration plan in this order:

1. Backup current project
2. Modify application imports/code
3. Remove obsolete dependency declarations
4. Add approved replacement declarations
5. Regenerate dependency metadata
6. Install dependencies
7. Run tests
8. Run build
9. Verify application behavior

Do not perform these steps now.

## FINAL REPORT

Return:

### Dependency Inventory

### Dependency Problems

### Recommended Replacements

### Source Files Requiring Changes

### Migration Plan

### Current Project Status

Confirm that this analysis made:

* zero dependency installations
* zero dependency removals
* zero package updates
* zero source-code modifications
* zero lockfile modifications
* zero application executions

STOP after the report.

Wait for my explicit approval before performing any migration.





After approval only

Only after the user explicitly approves the report in that thread:





Perform only the approved migration/install steps.



First install with scripts ignored when possible; run lifecycle scripts only after each has been read and is a normal build step.



Still never push or perform GitHub operations — leave that to the user.





Quick checklist





Step 1: malware/security scan done before any install/build/start



Markers removed (if any) and paths reported; stopped with no install/commit/push



Step 2: full read-only dependency report produced



Zero-change confirmation included



Stopped for explicit approval (or ran analysis first when told “just install”)



No GitHub push / PR / gh / remote publish by the agent

