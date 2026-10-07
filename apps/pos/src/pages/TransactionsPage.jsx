import {
    collectionGroup,
    limit,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import {
    Ban,
    Eye,
    HandCoins,
    Printer,
    ReceiptText,
    ShoppingCart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ActionIconButton from "../components/ui/ActionIconButton";
import Badge from "../components/ui/Badge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Modal from "../components/ui/Modal";
import SearchableSelect from "../components/ui/SearchableSelect";
import SearchInput from "../components/ui/SearchInput";
import ViewToggle from "../components/ui/ViewToggle";
import { db } from "../config/firebase";
import useAuthStore from "../stores/authStore";
import useTransactionStore from "../stores/transactionStore";
import { formatCurrency, formatDateTime } from "../utils/format";
import { useTranslation } from "../context/LocaleContext";

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { transactions, voidTransaction } = useTransactionStore();
  const { userDoc } = useAuthStore();
  const [superTx, setSuperTx] = useState([]);
  const [detail, setDetail] = useState(null);
  const [voiding, setVoiding] = useState(null);
  const [reason, setReason] = useState("");
  const [pwd, setPwd] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [saleType, setSaleType] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  useEffect(() => {
    if (userDoc?.role !== "superadmin") {
      setSuperTx([]);
      return undefined;
    }

    const q = query(
      collectionGroup(db, "transactions"),
      orderBy("date", "desc"),
      limit(1200),
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        const storeId = d.ref.parent.parent?.id || data.storeId;
        return { id: d.id, ...data, storeId };
      });
      setSuperTx(list);
    });
  }, [userDoc?.role]);

  const sourceTransactions =
    userDoc?.role === "superadmin" ? superTx : transactions;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sourceTransactions.filter((txn) => {
      if (status !== "all" && txn.status !== status) return false;
      if (method !== "all" && txn.paymentMethod !== method) return false;
      if (saleType !== "all" && (txn.saleType || "retail") !== saleType)
        return false;
      if (
        term &&
        !(
          txn.invoiceNo?.toLowerCase().includes(term) ||
          txn.customerName?.toLowerCase().includes(term) ||
          txn.paymentMethod?.toLowerCase().includes(term)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [sourceTransactions, status, method, saleType, q]);

  const liveStats = useMemo(() => {
    const completed = filtered.filter((t) => t.status === "completed");
    const revenue = completed.reduce(
      (s, t) => s + Number(t.grandTotal || 0),
      0,
    );
    return {
      count: filtered.length,
      revenue,
      avg: completed.length ? revenue / completed.length : 0,
    };
  }, [filtered]);

  const printReceipt = (t) => {
    const w = window.open("", "THERMAL_RECEIPT", "width=420,height=760");
    if (!w) {
      toast.error(t("receipt.popupBlocked"));
      return;
    }

    const rows = (t.items || [])
      .map(
        (it) => `
          <tr class="item-row">
            <td>
              <div class="item-name">${escapeHtml(it.name || "")}</div>
              <div class="item-meta">${Number(it.quantity) || 0} x ${formatCurrency(Number(it.unitPrice) || 0)}</div>
            </td>
            <td style="text-align:right;">${formatCurrency(it.total || 0)}</td>
          </tr>
        `,
      )
      .join("");

    const supportLine = t.store?.phone || t.store?.email || "Support desk";
    const noteLines = [
      "Goods once sold will only be exchanged with original receipt.",
      "Please report damaged or missing items at billing counter.",
      `Need help? Contact ${supportLine}.`,
    ];

    const notes = noteLines
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt ${t.invoiceNo || ""}</title>
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            html, body { width: 80mm; margin: 0; padding: 0; }
            body {
              font-family: "Segoe UI", "Arial", sans-serif;
              font-size: 11px;
              line-height: 1.35;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt { width: 76mm; margin: 0 auto; }
            .center { text-align: center; }
            .muted { color: #4b5563; }
            .sep { border-top: 1px dashed #9ca3af; margin: 7px 0; }
            .brand-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .logo {
              width: 28px;
              height: 28px;
              object-fit: contain;
              border-radius: 6px;
              border: 1px solid #d1d5db;
            }
            .brand-name { font-weight: 800; font-size: 15px; letter-spacing: 0.2px; }
            .headline {
              text-transform: uppercase;
              letter-spacing: 1px;
              font-size: 10px;
              color: #0f766e;
              font-weight: 700;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 10px;
            }
            .meta-label { color: #6b7280; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 3px 0; vertical-align: top; }
            th {
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: .5px;
              color: #374151;
              border-bottom: 1px dashed #9ca3af;
            }
            .item-row td { border-bottom: 1px dotted #d1d5db; }
            .item-name { font-weight: 600; }
            .item-meta { color: #6b7280; font-size: 10px; }
            .totals { margin-top: 4px; }
            .totals-row { display: flex; justify-content: space-between; margin: 2px 0; }
            .grand {
              font-weight: 800;
              font-size: 14px;
              padding-top: 2px;
              color: #0f172a;
            }
            .paid-pill {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 999px;
              background: #ecfeff;
              border: 1px solid #99f6e4;
              color: #0f766e;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: .4px;
              text-transform: uppercase;
            }
            .notes { margin: 0; padding-left: 14px; }
            .notes li { margin: 2px 0; }
            .footer-brand {
              text-align: center;
              color: #6b7280;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="brand-row">
                ${t.store?.logo ? `<img class="logo" src="${escapeHtml(t.store.logo)}" alt="logo" />` : ""}
                <div class="brand-name">${escapeHtml(t.store?.name || "Store")}</div>
              </div>
              <div class="headline">Tax Invoice / Sales Receipt</div>
              <div class="muted">${escapeHtml(t.store?.address || "")}</div>
              <div class="muted">Phone: ${escapeHtml(t.store?.phone || "-")}</div>
              <div class="muted">Email: ${escapeHtml(t.store?.email || "-")}</div>
              <div class="muted">GST: ${escapeHtml(t.store?.gstNumber || "-")}</div>
            </div>
            <div class="sep"></div>
            <div class="meta-grid">
              <div><span class="meta-label">Invoice</span><br /><b>${escapeHtml(t.invoiceNo || "-")}</b></div>
              <div><span class="meta-label">Date & Time</span><br />${escapeHtml(formatDateTime(t.date))}</div>
              <div><span class="meta-label">Cashier</span><br />${escapeHtml(t.cashierName || "-")}</div>
              ${t.customerName ? `<div><span class="meta-label">Customer</span><br />${escapeHtml(t.customerName)}</div>` : ""}
            </div>
            <div class="muted" style="margin-top: 4px;">Sale Type: <b>${escapeHtml((t.saleType || "retail").toUpperCase())}</b></div>
            <div class="sep"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="sep"></div>
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(t.subtotal || 0)}</span></div>
              <div class="totals-row"><span>Discount</span><span>-${formatCurrency(t.discountAmount || 0)}</span></div>
              <div class="totals-row"><span>Tax</span><span>${formatCurrency(t.taxTotal || 0)}</span></div>
              <div class="totals-row grand"><span>Grand Total</span><span>${formatCurrency(t.grandTotal || 0)}</span></div>
            </div>
            <div class="sep"></div>
            <div>Payment: <span class="paid-pill">${escapeHtml((t.paymentMethod || "").toUpperCase() || "PAID")}</span></div>
            ${t.paymentDetails?.cash != null ? `<div class="muted" style="margin-top:4px;">Received: ${formatCurrency(t.paymentDetails.cash)} | Change: ${formatCurrency(t.paymentDetails.change || 0)}</div>` : ""}
            <div class="sep"></div>
            <ul class="notes">${notes}</ul>
            <div class="sep"></div>
            <div class="center" style="font-weight: 700; font-size: 12px;">Thank you for shopping with us!</div>
            <div class="footer-brand" style="margin-top: 6px;">Please keep this receipt for warranty and returns.</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const confirmVoid = async () => {
    if (!voiding || !userDoc?.storeId) return;
    if (!reason.trim()) {
      toast.error(t("toast.voidReasonRequired"));
      return;
    }
    if (pwd !== "admin123") {
      toast.error(t("toast.invalidAdminPassword"));
      return;
    }
    try {
      await voidTransaction(userDoc.storeId, voiding.id, reason);
      toast.success(t("transactions.voided"));
      setVoiding(null);
      setReason("");
      setPwd("");
    } catch (e) {
      toast.error(e?.message || "Void failed");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">{t("transactions.title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Sales total",
            value: formatCurrency(liveStats.revenue),
            icon: HandCoins,
            tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-600",
          },
          {
            label: "Transactions",
            value: liveStats.count,
            icon: ShoppingCart,
            tone: "from-sky-500/15 to-sky-500/0 text-sky-600",
          },
          {
            label: "Avg order",
            value: formatCurrency(liveStats.avg),
            icon: ReceiptText,
            tone: "from-violet-500/15 to-violet-500/0 text-violet-600",
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border border-border bg-gradient-to-br ${c.tone} bg-surface p-4`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-text-muted">{c.label}</p>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-primary mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search by invoice, customer or payment..."
          />
        </div>
        <SearchableSelect
          className="min-w-[160px]"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "completed", label: "Completed" },
            { value: "voided", label: "Voided" },
          ]}
          placeholder="Status"
        />
        <SearchableSelect
          className="min-w-[160px]"
          value={method}
          onChange={setMethod}
          options={[
            { value: "all", label: "All payments" },
            { value: "cash", label: "Cash" },
            { value: "card", label: "Card" },
            { value: "upi", label: "UPI" },
            { value: "split", label: "Split" },
          ]}
          placeholder="Payment"
        />
        <SearchableSelect
          className="min-w-[170px]"
          value={saleType}
          onChange={setSaleType}
          options={[
            { value: "all", label: "All sale types" },
            { value: "retail", label: "Day-to-day" },
            { value: "wholesale", label: "Wholesale" },
          ]}
          placeholder="Sale type"
        />
        <ViewToggle view={view} onChange={setView} />
      </div>
      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-right">Items</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Pay</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/60">
                  <td className="p-3 font-mono text-xs">{t.invoiceNo}</td>
                  <td className="p-3 whitespace-nowrap text-text-muted">
                    {formatDateTime(t.date)}
                  </td>
                  <td className="p-3">{t.customerName}</td>
                  <td className="p-3 text-right">{t.items?.length || 0}</td>
                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(t.grandTotal)}
                  </td>
                  <td className="p-3 capitalize text-text-muted">
                    {t.paymentMethod}
                  </td>
                  <td className="p-3 capitalize text-text-muted">
                    {t.saleType || "retail"}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.status === "voided"
                          ? "error"
                          : t.status === "completed"
                            ? "success"
                            : "warning"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <ActionIconButton
                      title="View"
                      icon={Eye}
                      tone="info"
                      onClick={() => setDetail(t)}
                    />
                    <ActionIconButton
                      title="Print"
                      icon={Printer}
                      tone="success"
                      onClick={() => printReceipt(t)}
                    />
                    {t.status === "completed" && (
                      <ActionIconButton
                        title="Void"
                        icon={Ban}
                        tone="danger"
                        onClick={() => setVoiding(t)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-text-muted">
                    {t.invoiceNo}
                  </p>
                  <p className="font-semibold text-text-primary">
                    {t.customerName || "—"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDateTime(t.date)}
                  </p>
                </div>
                <Badge
                  variant={
                    t.status === "voided"
                      ? "error"
                      : t.status === "completed"
                        ? "success"
                        : "warning"
                  }
                >
                  {t.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Items</p>
                  <p className="font-semibold text-text-primary">
                    {t.items?.length || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Method</p>
                  <p className="font-semibold text-text-primary capitalize">
                    {t.paymentMethod || "-"}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Type</p>
                  <p className="font-semibold text-text-primary capitalize">
                    {t.saleType || "retail"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-primary">
                  {formatCurrency(t.grandTotal)}
                </p>
                <div className="flex items-center gap-1">
                  <ActionIconButton
                    title="View"
                    icon={Eye}
                    tone="info"
                    onClick={() => setDetail(t)}
                  />
                  <ActionIconButton
                    title="Print"
                    icon={Printer}
                    tone="success"
                    onClick={() => printReceipt(t)}
                  />
                  {t.status === "completed" && (
                    <ActionIconButton
                      title="Void"
                      icon={Ban}
                      tone="danger"
                      onClick={() => setVoiding(t)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Transaction"
        wide
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/60 p-3 text-xs text-text-muted">
              Click "Print" to generate thermal receipt with professional
              branding.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-xs text-text-muted uppercase border-b border-border">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.items || []).map((it, idx) => (
                    <tr key={idx} className="border-b border-border/60">
                      <td className="p-3">{it.name}</td>
                      <td className="p-3 text-right">{it.quantity}</td>
                      <td className="p-3 text-right text-text-muted">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 bg-background/50 p-3 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span>{formatCurrency(detail.subtotal || 0)}</span>
              </div>
              {detail.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Discount</span>
                  <span className="text-emerald-600">
                    -${formatCurrency(detail.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Tax</span>
                <span>{formatCurrency(detail.taxTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span>Grand Total</span>
                <span className="text-primary">
                  {formatCurrency(detail.grandTotal)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-background p-2">
                <p className="text-text-muted text-xs">Payment Method</p>
                <p className="font-semibold capitalize">
                  {detail.paymentMethod}
                </p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-text-muted text-xs">Sale Type</p>
                <p className="font-semibold capitalize">
                  {detail.saleType || "retail"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => printReceipt(detail)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/80 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!voiding}
        onClose={() => {
          setVoiding(null);
          setReason("");
          setPwd("");
        }}
        title="Void transaction"
        message={
          <div className="space-y-2 text-left">
            <textarea
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Admin password (demo: admin123)"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
        }
        danger
        confirmLabel="Void"
        onConfirm={confirmVoid}
      />
    </div>
  );
}
