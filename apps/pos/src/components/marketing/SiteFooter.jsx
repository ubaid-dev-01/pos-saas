import { Link } from "react-router-dom";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { to: "/features", label: "Overview" },
      { to: "/features#inventory", label: "Inventory" },
      { to: "/features#analytics", label: "Analytics" },
      { to: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { to: "/#industries", label: "Industries" },
      { to: "/features#multi-store", label: "Multi-store" },
      { to: "/contact", label: "Migration" },
      { to: "/about", label: "About QuickPOS" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/#faq", label: "Help center / FAQ" },
      { to: "/contact", label: "Talk to sales" },
      { to: "/privacy", label: "Security & privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "Company" },
      { to: "/contact", label: "Contact" },
      { to: "/refund", label: "Refund policy" },
      {
        href: QUICKPOS_CONTACT.whatsappDemo,
        label: "WhatsApp",
        external: true,
      },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-mkt-100 bg-mkt-50">
      <div className="mkt-container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <img
              src="/files/logo-full.svg"
              alt="QuickPOS"
              className="h-9 w-auto"
              width={144}
              height={36}
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mkt-500">
              The retail commerce platform for stores that outgrow spreadsheets
              — checkout, inventory, teams, and multi-branch operations in one
              system.
            </p>
            <p className="mt-6 text-sm text-mkt-700">
              {QUICKPOS_CONTACT.office}
              <br />
              <a
                href={QUICKPOS_CONTACT.phoneLink}
                className="font-semibold text-mkt-navy hover:text-mkt-indigo"
              >
                {QUICKPOS_CONTACT.phoneDisplay}
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mkt-500">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-mkt-700 hover:text-mkt-indigo"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-sm font-medium text-mkt-700 hover:text-mkt-indigo"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="mkt-rule mt-14" />

        <div className="mt-6 flex flex-col gap-3 text-xs text-mkt-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QuickPOS. All rights reserved.</p>
          <p>
            Built for operators who need trust at the counter — and clarity in
            the back office.
          </p>
        </div>
      </div>
    </footer>
  );
}
