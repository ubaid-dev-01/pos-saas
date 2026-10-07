import JsonLd, {
  faqSchema,
  organizationSchema,
  softwareSchema,
} from "../../components/marketing/JsonLd";
import Seo from "../../components/marketing/Seo";
import {
  AnalyticsStage,
  CheckoutStage,
  CustomersStage,
  InventoryStage,
  ReceiptStage,
} from "../../components/product/ProductStages";
import {
  PxButton,
  PxChapter,
  PxChapterTitle,
  PxContainer,
  PxEyebrow,
  PxLead,
  PxReveal,
  PxStageFrame,
} from "../../components/product/PxPrimitives";
import { QUICKPOS_CONTACT } from "../../constants/marketing";
import { SITE_URL, TRUST_SECTORS } from "../../constants/siteContent";

const FAQS_SHORT = [
  {
    q: "Is QuickPOS free to start?",
    a: "Yes. Starter is free forever — up to 50 products, unlimited transactions, no card required. Upgrade only when you need more stores, staff, or analytics.",
  },
  {
    q: "How fast can we go live?",
    a: "Most stores sell the same day: create an account, add products, invite staff. Premium includes migration help from Excel or your old POS.",
  },
  {
    q: "Does it work on phones and tablets?",
    a: "Yes. QuickPOS is built for the counter — desktop, tablet, or phone — with the same checkout workflow.",
  },
  {
    q: "Is data secure?",
    a: "We run on Google Firebase with encryption in transit and at rest, automatic backups, and role-based access for every staff account.",
  },
];

export default function HomePage() {
  const faqs = FAQS_SHORT;

  return (
    <>
      <Seo
        title="QuickPOS — Retail Commerce Operating System"
        description="Run checkout, inventory, customers, and multi-store operations from one system built for the retail floor. Start free."
        url={SITE_URL}
        image={`${SITE_URL}/brand/og-mark.svg`}
        keywords="POS software Pakistan, cloud POS, inventory management, retail checkout, QuickPOS"
      />
      <JsonLd
        data={[
          organizationSchema(),
          softwareSchema(),
          faqSchema(
            faqs.map((f) => ({
              q: f.q || f.question,
              a: f.a || f.answer,
            })),
          ),
        ]}
      />

      {/* HERO — brand + one line + one sentence + CTA + one stage */}
      <section className="px-hero">
        <PxContainer>
          <PxReveal className="px-hero-copy">
            <h1 className="px-brand">QuickPOS</h1>
            <p className="px-chapter-title" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 500 }}>
              Truth at the counter.
            </p>
            <PxLead>
              Checkout, stock, customers, and reports in one system — so your floor moves and your books stay honest.
            </PxLead>
            <div className="px-cta-row">
              <PxButton to="/register" variant="primary">
                Start free
              </PxButton>
              <PxButton
                href={QUICKPOS_CONTACT.whatsappDemo}
                variant="secondary"
                target="_blank"
                rel="noreferrer"
              >
                Book a demo
              </PxButton>
            </div>
          </PxReveal>
          <PxReveal className="px-hero-stage" delay={0.1}>
            <PxStageFrame caption="Live checkout · Not a mock dashboard">
              <CheckoutStage />
            </PxStageFrame>
          </PxReveal>
        </PxContainer>
      </section>

      {/* Trust — quiet, same family */}
      <section className="px-trust" aria-label="Industries">
        <PxContainer>
          <div className="px-trust-inner">
            <p className="px-trust-label">Built for</p>
            <div className="px-trust-sectors">
              {TRUST_SECTORS.slice(0, 6).map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </PxContainer>
      </section>

      {/* Chapters — one visual family */}
      <PxChapter
        id="checkout"
        eyebrow="Checkout"
        title="The counter, without friction."
        lead="Scan, search, discount, hold carts, and settle — cash, card, or split — without leaving the sale."
        stage={<CheckoutStage />}
        caption="Barcode · Hold cart · Split tender"
      />

      <PxChapter
        id="inventory"
        eyebrow="Inventory"
        title="Stock that tells the truth."
        lead="Every sale writes back instantly. Low-stock alerts fire before the shelf goes empty."
        stage={<InventoryStage />}
        caption="Live qty · Threshold alerts · Audit trail"
        reverse
      />

      <PxChapter
        id="receipts"
        eyebrow="Receipts"
        title="The sale ends when the customer has proof."
        lead="Print, WhatsApp, or email a branded receipt in one tap — no second system, no retyping."
        stage={<ReceiptStage />}
        caption="Print · WhatsApp · Email"
      />

      <PxChapter
        id="customers"
        eyebrow="Customers"
        title="Regulars, remembered."
        lead="Profiles, purchase history, and loyalty points travel with every visit — so staff never guess."
        stage={<CustomersStage />}
        caption="History · Loyalty · Follow-up"
        reverse
      />

      <PxChapter
        id="analytics"
        eyebrow="Analytics"
        title="Owner clarity after hours."
        lead="See sales, average ticket, and movement while decisions still matter — export when you need it."
        stage={<AnalyticsStage />}
        caption="Trends · Margins · Export-ready"
      />

      {/* Workflow */}
      <section className="px-section" id="workflow" style={{ paddingTop: 0 }}>
        <PxContainer>
          <PxReveal>
            <PxEyebrow>Workflow</PxEyebrow>
            <PxChapterTitle>One loop. Every store day.</PxChapterTitle>
            <PxLead>Sell → sync → remember → decide. No spreadsheet between steps.</PxLead>
          </PxReveal>
        </PxContainer>
        <div className="px-workflow mt-12">
          {[
            { n: "01", t: "Sell", b: "Fast, accurate checkout under peak pressure." },
            { n: "02", t: "Sync", b: "Inventory updates the moment the receipt prints." },
            { n: "03", t: "Remember", b: "Customers and loyalty travel with every visit." },
            { n: "04", t: "Decide", b: "Owners see margins while they’re still actionable." },
          ].map((s) => (
            <PxReveal key={s.n} className="px-workflow-step">
              <p className="px-workflow-num">{s.n}</p>
              <h3 className="px-workflow-title">{s.t}</h3>
              <p className="px-workflow-body">{s.b}</p>
            </PxReveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-section" id="pricing">
        <PxContainer>
          <PxReveal>
            <PxEyebrow>Pricing</PxEyebrow>
            <PxChapterTitle>Start free. Scale when the floor demands it.</PxChapterTitle>
            <PxLead>No surprise fees. Premium is a conversation — sized to your stores and staff.</PxLead>
          </PxReveal>
          <div className="px-pricing mt-12">
            <PxReveal className="px-plan">
              <p className="px-plan-name">Starter</p>
              <p className="px-plan-price">
                Rs 0 <span>/ forever</span>
              </p>
              <ul className="px-plan-list">
                <li>1 store · 1 admin</li>
                <li>Up to 50 products</li>
                <li>Unlimited transactions</li>
                <li>Basic reports</li>
              </ul>
              <div className="px-cta-row">
                <PxButton to="/register" variant="secondary">
                  Create account
                </PxButton>
              </div>
            </PxReveal>
            <PxReveal className="px-plan is-featured" delay={0.06}>
              <p className="px-plan-name">Premium</p>
              <p className="px-plan-price">
                Custom <span>quote</span>
              </p>
              <ul className="px-plan-list">
                <li>Unlimited stores &amp; staff</li>
                <li>Unlimited products</li>
                <li>Loyalty &amp; advanced analytics</li>
                <li>Migration &amp; onboarding</li>
              </ul>
              <div className="px-cta-row">
                <PxButton href={QUICKPOS_CONTACT.phoneLink} variant="primary">
                  Call {QUICKPOS_CONTACT.phoneDisplay}
                </PxButton>
              </div>
            </PxReveal>
          </div>
        </PxContainer>
      </section>

      {/* FAQ */}
      <section className="px-section" id="faq">
        <PxContainer>
          <div className="px-split">
            <PxReveal className="px-split-copy">
              <PxEyebrow>FAQ</PxEyebrow>
              <PxChapterTitle>Straight answers.</PxChapterTitle>
              <PxLead>Compare on speed to learn, stock accuracy, and whether owners get usable reports.</PxLead>
            </PxReveal>
            <PxReveal className="px-faq">
              {FAQS_SHORT.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </PxReveal>
          </div>
        </PxContainer>
      </section>

      {/* Close */}
      <section className="px-close">
        <PxContainer>
          <PxReveal>
            <p className="px-brand">QuickPOS</p>
            <PxLead>Join stores that already run their floor on one system.</PxLead>
            <div className="px-cta-row">
              <PxButton to="/register" variant="primary">
                Start free
              </PxButton>
              <PxButton
                href={QUICKPOS_CONTACT.whatsappGeneric}
                variant="secondary"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp us
              </PxButton>
            </div>
          </PxReveal>
        </PxContainer>
      </section>
    </>
  );
}
