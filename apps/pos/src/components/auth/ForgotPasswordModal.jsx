import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import {
  resetPasswordWithOtp,
  sendEmailOtp,
} from "../../services/emailService";
import Modal from "../ui/Modal";

export default function ForgotPasswordModal({ open, onClose }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setOtpSent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const sendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t("auth.forgot.invalidEmail"));
      return;
    }
    setBusy(true);
    try {
      await sendEmailOtp(trimmed, "reset-password");
      setOtpSent(true);
      toast.success(t("auth.forgot.otpSent"));
    } catch (e) {
      toast.error(e?.message || t("auth.forgot.otpSendFailed"));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || otp.trim().length !== 6 || newPassword.length < 6) {
      toast.error(t("auth.forgot.invalidForm"));
      return;
    }
    setBusy(true);
    try {
      await resetPasswordWithOtp(trimmed, otp.trim(), newPassword);
      toast.success(t("auth.forgot.passwordUpdated"));
      handleClose();
    } catch (e) {
      const msg = e?.message || t("auth.forgot.updateFailed");
      if (e?.code === "ADMIN_NOT_CONFIGURED" || msg.includes("Firebase Admin")) {
        toast.error(t("auth.forgot.adminSetup"), { duration: 10000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("auth.forgot.title")}>
      <div className="auth-ledger space-y-3 !min-h-0 !bg-transparent p-0">
        <p className="text-sm text-[var(--auth-muted)]">
          {t("auth.forgot.descOtp")}
        </p>
        <p className="border border-[#e8c48a] bg-[#fbf6ee] px-3 py-2 text-xs text-[#8a5a12]">
          {t("auth.forgot.adminHint")}
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent || busy}
          className="auth-field disabled:bg-[var(--auth-paper)]"
          placeholder={t("auth.login.emailPlaceholder")}
        />
        {!otpSent ? (
          <button
            type="button"
            onClick={sendOtp}
            disabled={busy}
            className="auth-btn"
          >
            {busy ? t("auth.forgot.sendingOtp") : t("auth.forgot.sendOtp")}
          </button>
        ) : (
          <>
            <p className="text-xs font-medium text-[var(--auth-signal)]">
              {t("auth.forgot.otpInbox")}
            </p>
            <input
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="auth-field auth-otp"
              placeholder={t("auth.forgot.otpPlaceholder")}
              maxLength={6}
              inputMode="numeric"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-field"
              placeholder={t("auth.forgot.newPasswordPlaceholder")}
            />
            <button
              type="button"
              onClick={resetPassword}
              disabled={busy}
              className="auth-btn"
            >
              {busy ? t("auth.forgot.updating") : t("auth.forgot.resetWithOtp")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                sendOtp();
              }}
              disabled={busy}
              className="auth-btn-ghost text-xs"
            >
              {t("auth.forgot.resendOtp")}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
