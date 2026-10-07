import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  ExternalLink,
  Mail,
  MessageCircleMore,
  Phone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "../../context/LocaleContext";
import { db } from "../../config/firebase";
import { exportToCSV, exportToJSON } from "../../utils/exportData";
import { formatDateTime } from "../../utils/format";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";
import ViewToggle from "../ui/ViewToggle";

const STATUS = ["new", "contacted", "qualified", "converted", "lost"];

const BUSINESS_TYPES = [
  "Retail",
  "Restaurant",
  "Salon",
  "Pharmacy",
  "Grocery",
  "Other",
];

const businessTypeKey = {
  Retail: "marketing.lead.businessTypeRetail",
  Restaurant: "marketing.lead.businessTypeRestaurant",
  Salon: "marketing.lead.businessTypeSalon",
  Pharmacy: "marketing.lead.businessTypePharmacy",
  Grocery: "marketing.lead.businessTypeGrocery",
  Other: "marketing.lead.businessTypeOther",
};

export default function LeadsManager({ leads: leadsProp }) {
  const { t } = useTranslation();
  const [liveLeads, setLiveLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState("");

  const statusLabel = (status) => t(`superAdmin.leads.status.${status}`);

  const businessTypeLabel = (type) =>
    businessTypeKey[type] ? t(businessTypeKey[type]) : type;

  useEffect(() => {
    if (Array.isArray(leadsProp)) return undefined;
    const qRef = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    return onSnapshot(qRef, (snap) => {
      setLiveLeads(
        snap.docs.map((docRef) => ({ id: docRef.id, ...docRef.data() })),
      );
    });
  }, [leadsProp]);

  const leads = Array.isArray(leadsProp) ? leadsProp : liveLeads;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((lead) => {
      const okStatus = statusFilter === "all" || lead.status === statusFilter;
      const okType = typeFilter === "all" || lead.businessType === typeFilter;
      const okSearch =
        !term ||
        lead.name?.toLowerCase().includes(term) ||
        lead.businessName?.toLowerCase().includes(term) ||
        lead.phone?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term);
      return okStatus && okType && okSearch;
    });
  }, [leads, statusFilter, typeFilter, q]);

  const updateLead = async (id, patch) => {
    await updateDoc(doc(db, "leads", id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const addNote = async () => {
    if (!selectedLead || !noteText.trim()) return;
    const history = Array.isArray(selectedLead.notesHistory)
      ? selectedLead.notesHistory
      : [];
    const next = [
      ...history,
      {
        text: noteText.trim(),
        at: new Date().toISOString(),
      },
    ];
    await updateLead(selectedLead.id, {
      notesHistory: next,
      notes: noteText.trim(),
    });
    setSelectedLead((prev) => ({
      ...prev,
      notesHistory: next,
      notes: noteText.trim(),
    }));
    setNoteText("");
  };

  const columns = [
    { key: "name", label: t("common.name") },
    { key: "businessName", label: t("superAdmin.leads.col.business") },
    { key: "phone", label: t("common.phone") },
    { key: "email", label: t("common.email") },
    { key: "businessType", label: t("superAdmin.leads.col.type") },
    { key: "storeCount", label: t("superAdmin.leads.col.stores") },
    { key: "status", label: t("common.status") },
    { key: "source", label: t("superAdmin.leads.col.source") },
    { key: "createdAt", label: t("superAdmin.leads.col.date"), format: "datetime" },
  ];

  const statusOptions = [
    { value: "all", label: t("superAdmin.leads.allStatuses") },
    ...STATUS.map((status) => ({
      value: status,
      label: statusLabel(status),
    })),
  ];

  const businessTypeOptions = [
    { value: "all", label: t("superAdmin.leads.allBusinessTypes") },
    ...BUSINESS_TYPES.map((type) => ({
      value: type,
      label: businessTypeLabel(type),
    })),
  ];

  const leadStatusOptions = STATUS.map((status) => ({
    value: status,
    label: statusLabel(status),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-lg font-bold text-text-primary">
          {t("superAdmin.leads.title")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(filtered, columns, "quickpos-leads")}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportCsv")}
          </button>
          <button
            type="button"
            onClick={() => exportToJSON(filtered, "quickpos-leads")}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportJson")}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t("superAdmin.leads.searchPlaceholder")}
          />
        </div>
        <SearchableSelect
          className="min-w-[180px]"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder={t("superAdmin.leads.statusPlaceholder")}
        />
        <SearchableSelect
          className="min-w-[210px]"
          value={typeFilter}
          onChange={setTypeFilter}
          options={businessTypeOptions}
          placeholder={t("superAdmin.leads.businessTypePlaceholder")}
        />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "table" ? (
        <div className="overflow-auto rounded-xl border border-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.lead")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.contact")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.business")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.status")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.notes")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("superAdmin.leads.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-t border-border align-top">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(lead)}
                      className="text-left"
                    >
                      <p className="font-semibold text-text-primary">
                        {lead.name || "-"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {lead.businessName || "-"}
                      </p>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <a
                      className="block text-primary"
                      href={`tel:${(lead.phone || "").replaceAll(" ", "")}`}
                    >
                      {lead.phone || "-"}
                    </a>
                    {lead.email && (
                      <a
                        className="block text-xs text-text-muted"
                        href={`mailto:${lead.email}`}
                      >
                        {lead.email}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-text-muted">
                    <p>{businessTypeLabel(lead.businessType) || "-"}</p>
                    <p>
                      {t("superAdmin.leads.storesCount", {
                        count: lead.storeCount || "-",
                      })}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <SearchableSelect
                      className="min-w-[160px]"
                      value={lead.status || "new"}
                      onChange={(value) =>
                        updateLead(lead.id, { status: value })
                      }
                      options={leadStatusOptions}
                    />
                  </td>
                  <td className="px-3 py-3 min-w-[240px]">
                    <textarea
                      defaultValue={lead.notes || ""}
                      onBlur={(e) =>
                        updateLead(lead.id, { notes: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-border px-2 py-1.5"
                      placeholder={t("superAdmin.leads.internalNotes")}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <a
                        title={t("superAdmin.leads.call")}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10"
                        href={`tel:${(lead.phone || "").replaceAll(" ", "")}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        title={t("common.whatsapp")}
                        className="p-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/${(lead.phone || "").replaceAll("+", "").replaceAll(" ", "")}?text=Hi%20${encodeURIComponent(lead.name || "")}%2C%20this%20is%20QuickPOS.`}
                      >
                        <MessageCircleMore className="w-4 h-4" />
                      </a>
                      {lead.email && (
                        <a
                          title={t("common.email")}
                          className="p-2 rounded-lg text-text-muted hover:bg-background"
                          href={`mailto:${lead.email}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-muted">
                    {t("superAdmin.leads.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-3"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(lead)}
                  className="text-left"
                >
                  <p className="font-semibold text-text-primary">
                    {lead.name || "-"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {lead.businessName || "-"}
                  </p>
                </button>
              </div>
              <div className="text-xs text-text-muted space-y-1">
                <p>{lead.phone || "-"}</p>
                <p>{lead.email || t("superAdmin.leads.noEmail")}</p>
                <p>
                  {businessTypeLabel(lead.businessType) || "-"} ·{" "}
                  {t("superAdmin.leads.storesCount", {
                    count: lead.storeCount || "-",
                  })}
                </p>
              </div>
              <SearchableSelect
                className="w-full"
                value={lead.status || "new"}
                onChange={(value) => updateLead(lead.id, { status: value })}
                options={leadStatusOptions}
              />
              <div className="flex items-center gap-1">
                <a
                  title={t("superAdmin.leads.call")}
                  className="p-2 rounded-lg text-primary hover:bg-primary/10"
                  href={`tel:${(lead.phone || "").replaceAll(" ", "")}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  title={t("common.whatsapp")}
                  className="p-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${(lead.phone || "").replaceAll("+", "").replaceAll(" ", "")}?text=Hi%20${encodeURIComponent(lead.name || "")}%2C%20this%20is%20QuickPOS.`}
                >
                  <MessageCircleMore className="w-4 h-4" />
                </a>
                {lead.email && (
                  <a
                    title={t("common.email")}
                    className="p-2 rounded-lg text-text-muted hover:bg-background"
                    href={`mailto:${lead.email}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.businessName || t("superAdmin.leads.detailTitle")}
      >
        {selectedLead && (
          <div className="space-y-3 text-sm">
            <p className="text-text-muted">
              {selectedLead.name} · {selectedLead.phone} ·{" "}
              {selectedLead.email || t("superAdmin.leads.noEmail")}
            </p>
            <p className="text-text-muted">
              {t("superAdmin.leads.statusLabel", {
                status: statusLabel(selectedLead.status || "new"),
              })}
            </p>
            <p className="text-text-muted">
              {t("superAdmin.leads.createdLabel", {
                date: formatDateTime(selectedLead.createdAt),
              })}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${(selectedLead.phone || "").replaceAll(" ", "")}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-background"
              >
                <Phone className="w-4 h-4" /> {t("superAdmin.leads.call")}
              </a>
              <a
                href={`https://wa.me/${(selectedLead.phone || "").replaceAll("+", "").replaceAll(" ", "")}?text=Hi%20${encodeURIComponent(selectedLead.name || "")}%2C%20this%20is%20QuickPOS.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-background"
              >
                <MessageCircleMore className="w-4 h-4" /> {t("common.whatsapp")}
              </a>
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-background"
                >
                  <Mail className="w-4 h-4" /> {t("common.email")}
                </a>
              )}
              {selectedLead.website && (
                <a
                  href={selectedLead.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-background"
                >
                  <ExternalLink className="w-4 h-4" /> {t("superAdmin.leads.website")}
                </a>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-text-primary">
                {t("superAdmin.leads.notesHistory")}
              </p>
              <div className="space-y-1 max-h-48 overflow-auto rounded-xl border border-border p-2">
                {(selectedLead.notesHistory || []).map((note, index) => (
                  <div key={index} className="rounded-lg bg-background p-2">
                    <p className="text-text-primary">{note.text}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatDateTime(note.at)}
                    </p>
                  </div>
                ))}
                {!selectedLead.notesHistory?.length && (
                  <p className="text-xs text-text-muted">
                    {t("superAdmin.leads.noNotes")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-xl border border-border px-3 py-2"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={t("superAdmin.leads.addNote")}
                />
                <button
                  type="button"
                  onClick={addNote}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                >
                  {t("common.add")}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
