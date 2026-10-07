import { Banknote, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";
import useCashSessionStore from "../../stores/cashSessionStore";
import { formatCurrency } from "../../utils/format";
import Modal from "../ui/Modal";

export default function CashSessionBar() {
  const { t } = useTranslation();
  const { user, userDoc, store } = useAuthStore();
  const { session, subscribe, cleanup, openSession, closeSession } =
    useCashSessionStore();
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [openingCash, setOpeningCash] = useState("5000");
  const [actualCash, setActualCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userDoc?.storeId) return undefined;
    subscribe(userDoc.storeId);
    return () => cleanup();
  }, [userDoc?.storeId, subscribe, cleanup]);

  const handleOpen = async () => {
    if (!userDoc?.storeId) return;
    setBusy(true);
    try {
      await openSession(userDoc.storeId, {
        cashierId: user.uid,
        cashierName: userDoc.displayName || user.email,
        openingCash: Number(openingCash) || 0,
        registerName: store?.name ? `${store.name}   Counter 1` : "Counter 1",
      });
      toast.success(t("pos.cashSession.opened"));
      setOpenModal(false);
    } catch (e) {
      toast.error(e?.message || t("pos.cashSession.openFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    if (!userDoc?.storeId || !session) return;
    setBusy(true);
    try {
      await closeSession(userDoc.storeId, session.id, {
        actualCash: Number(actualCash) || 0,
        closingNotes,
      });
      toast.success(t("pos.cashSession.closed"));
      setCloseModal(false);
      setActualCash("");
      setClosingNotes("");
    } catch (e) {
      toast.error(e?.message || t("pos.cashSession.closeFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-surface px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary shrink-0" />
          {session ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success font-semibold">
                <Unlock className="h-3 w-3" /> {t("pos.cashSession.drawerOpen")}
              </span>
              <span className="text-text-muted">
                {t("pos.cashSession.opening", {
                  amount: formatCurrency(session.openingCash),
                  count: session.totalSales || 0,
                  expected: formatCurrency(session.expectedCash),
                })}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-text-muted">
              <Lock className="h-3 w-3" /> {t("pos.cashSession.noSession")}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!session ? (
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white"
            >
              {t("pos.cashSession.openDrawer")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActualCash(String(Math.round(session.expectedCash || 0)));
                setCloseModal(true);
              }}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold hover:bg-background"
            >
              {t("pos.cashSession.closeReconcile")}
            </button>
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={t("pos.cashSession.openTitle")}>
        <div className="space-y-3 text-sm">
          <p className="text-text-muted text-xs">{t("pos.cashSession.openDesc")}</p>
          <div>
            <label className="text-xs text-text-muted">{t("pos.cashSession.openingCash")}</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleOpen}
            className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? t("pos.cashSession.openingBusy") : t("pos.cashSession.startSession")}
          </button>
        </div>
      </Modal>

      <Modal open={closeModal} onClose={() => setCloseModal(false)} title={t("pos.cashSession.closeTitle")}>
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-background p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">{t("pos.cashSession.expected")}</span>
              <span className="font-semibold">
                {formatCurrency(session?.expectedCash || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t("pos.cashSession.totalSales")}</span>
              <span>{formatCurrency(session?.totalSalesAmount || 0)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted">{t("pos.cashSession.actualCash")}</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
            />
          </div>
          {actualCash !== "" && (
            <p className="text-xs">
              {t("pos.cashSession.difference")}:{" "}
              <span
                className={
                  Math.abs(
                    (Number(actualCash) || 0) - (session?.expectedCash || 0),
                  ) < 1
                    ? "text-success font-semibold"
                    : "text-error font-semibold"
                }
              >
                {formatCurrency(
                  (Number(actualCash) || 0) - (session?.expectedCash || 0),
                )}
              </span>
            </p>
          )}
          <div>
            <label className="text-xs text-text-muted">{t("common.notes")} ({t("common.optional")})</label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? t("pos.cashSession.closingBusy") : t("pos.cashSession.closeSession")}
          </button>
        </div>
      </Modal>
    </>
  );
}
