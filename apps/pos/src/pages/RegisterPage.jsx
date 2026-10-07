import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Store,
  UserPlus,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import LoadingScreen from "../components/ui/LoadingScreen";
import PasswordInput from "../components/ui/PasswordInput";
import SearchableSelect from "../components/ui/SearchableSelect";
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from "../constants/currencies";
import { useTranslation } from "../context/LocaleContext";
import {
  sendEmailOtp,
  sendStoreWelcomeEmail,
  verifyEmailOtp,
} from "../services/emailService";
import useAuthStore from "../stores/authStore";

const fieldWrap =
  "auth-field-wrap !rounded-none border-[var(--auth-line)] bg-[var(--auth-surface)] focus-within:!ring-0 focus-within:border-[var(--auth-signal)]";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { user, userDoc, registerAdmin, registerStore, authHydrated } =
    useAuthStore();
  const storeFormPrimed = useRef("");
  const [otpCode, setOtpCode] = useState("");
  const [otpState, setOtpState] = useState({
    sent: false,
    email: "",
    displayName: "",
    password: "",
  });

  const accountForm = useForm({
    mode: "onBlur",
    defaultValues: { displayName: "", email: "", password: "", confirm: "" },
  });

  const storeForm = useForm({
    mode: "onBlur",
    defaultValues: {
      storeName: "",
      address: "",
      phone: "",
      storeEmail: "",
      gstNumber: "",
      currency: "PKR",
    },
  });

  useLayoutEffect(() => {
    if (!user || userDoc?.role !== "admin" || userDoc?.storeId) return;
    const k = `${user.uid}_store`;
    if (storeFormPrimed.current === k) return;
    storeFormPrimed.current = k;
    storeForm.reset({
      storeName: "",
      address: "",
      phone: "",
      storeEmail: user.email || "",
      gstNumber: "",
      currency: "PKR",
    });
  }, [user, userDoc, storeForm]);

  if (!authHydrated) return <LoadingScreen />;
  if (user && !userDoc) return <LoadingScreen />;
  if (user && userDoc?.storeId) return <Navigate to="/pos" replace />;
  if (user && userDoc?.role === "superadmin")
    return <Navigate to="/super-admin" replace />;

  const clearOtpStep = () => {
    setOtpState({ sent: false, email: "", displayName: "", password: "" });
    setOtpCode("");
  };

  const onAccount = accountForm.handleSubmit(async (data) => {
    if (data.password !== data.confirm) {
      toast.error(t("auth.register.confirmMismatch"));
      return;
    }
    const email = String(data.email || "")
      .trim()
      .toLowerCase();
    try {
      await sendEmailOtp(email, "register");
      setOtpState({
        sent: true,
        email,
        displayName: data.displayName,
        password: data.password,
      });
      setOtpCode("");
      toast.success(t("auth.register.otpSent"));
    } catch (e) {
      toast.error(
        e?.message ||
          "Could not send verification email. Use a real inbox — temporary emails are blocked.",
      );
    }
  });

  const onVerifyOtp = async () => {
    if (!otpState.sent) return;
    if (!otpCode.trim()) {
      toast.error(t("auth.register.enterOtp"));
      return;
    }
    try {
      await verifyEmailOtp(otpState.email, "register", otpCode.trim());
      await registerAdmin(
        otpState.email,
        otpState.password,
        otpState.displayName,
      );
      toast.success(t("auth.register.verifiedStoreNext"));
    } catch (e) {
      toast.error(e?.message || t("auth.register.otpVerifyFailed"));
    }
  };

  const resendOtp = async () => {
    if (!otpState.sent) return;
    try {
      await sendEmailOtp(otpState.email, "register");
      toast.success(t("auth.register.otpResent"));
    } catch (e) {
      toast.error(e?.message || t("auth.register.otpResendFailed"));
    }
  };

  const onStore = storeForm.handleSubmit(async (data) => {
    try {
      await registerStore({
        name: data.storeName,
        address: data.address,
        phone: data.phone,
        email: data.storeEmail,
        gstNumber: data.gstNumber,
        currency: data.currency,
      });
      await sendStoreWelcomeEmail({
        to: data.storeEmail || user?.email || "",
        ownerName: userDoc?.displayName || user?.displayName || "",
        storeName: data.storeName,
        city: data.address || "Multan, Pakistan",
      });
      toast.success(t("auth.register.storeSuccess"));
    } catch (e) {
      toast.error(e?.message || t("auth.register.storeFailed"));
    }
  });

  if (!user) {
    return (
      <AuthShell
        brandBadge={t("auth.register.panelAccount")}
        brandTitle={t("auth.register.accountTitle")}
        brandDesc={t("auth.register.accountDesc")}
        features={[
          {
            icon: UserPlus,
            title: t("auth.register.panelStep1Title"),
            desc: t("auth.register.panelStep1Desc"),
          },
          {
            icon: Store,
            title: t("auth.register.panelStep2Title"),
            desc: t("auth.register.panelStep2Desc"),
          },
          {
            icon: ShieldCheck,
            title: t("auth.register.panelStep3Title"),
            desc: t("auth.register.panelStep3Desc"),
          },
        ]}
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="bg-[var(--auth-signal)] px-3 py-1 text-xs font-semibold text-white">
            {t("auth.register.badgeAccount")}
          </span>
          <span className="border border-[var(--auth-line)] bg-[var(--auth-paper)] px-3 py-1 text-xs font-semibold text-[var(--auth-muted)]">
            {t("auth.register.badgeStore")}
          </span>
        </div>

        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--auth-muted)]">
              {t("auth.register.formLabel")}
            </p>
            <h1 className="auth-display mt-2 text-3xl font-semibold text-[var(--auth-ink)]">
              {t("auth.register.formTitle")}
            </h1>
          </div>
          <span className="auth-icon">
            <BadgeCheck className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <form onSubmit={onAccount} className="space-y-4">
          <div>
            <label className="auth-label" htmlFor="reg-displayName">
              {t("auth.register.displayName")}
            </label>
            <input
              id="reg-displayName"
              autoComplete="name"
              disabled={otpState.sent}
              className="auth-field disabled:cursor-not-allowed disabled:opacity-60"
              {...accountForm.register("displayName", {
                required: t("auth.register.displayNameRequired"),
              })}
            />
            {accountForm.formState.errors.displayName ? (
              <p className="auth-error">
                {accountForm.formState.errors.displayName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="auth-label" htmlFor="reg-email">
              {t("auth.register.email")}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              readOnly={otpState.sent}
              className="auth-field read-only:cursor-not-allowed read-only:opacity-60"
              {...accountForm.register("email", {
                required: t("auth.register.emailRequired"),
              })}
            />
            {accountForm.formState.errors.email ? (
              <p className="auth-error">
                {accountForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="auth-label" htmlFor="reg-password">
              {t("auth.register.password")}
            </label>
            <PasswordInput
              id="reg-password"
              autoComplete="new-password"
              placeholder={t("auth.register.passwordPlaceholder")}
              wrapperClassName={fieldWrap}
              leftIcon={LockKeyhole}
              disabled={otpState.sent}
              {...accountForm.register("password", {
                required: true,
                minLength: {
                  value: 6,
                  message: t("auth.register.passwordMin"),
                },
              })}
            />
            {accountForm.formState.errors.password ? (
              <p className="auth-error">
                {accountForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="auth-label" htmlFor="reg-confirm">
              {t("auth.register.confirmPassword")}
            </label>
            <PasswordInput
              id="reg-confirm"
              autoComplete="new-password"
              placeholder={t("auth.register.confirmPlaceholder")}
              wrapperClassName={fieldWrap}
              leftIcon={ShieldCheck}
              disabled={otpState.sent}
              {...accountForm.register("confirm", {
                required: t("auth.register.confirmRequired"),
              })}
            />
            {accountForm.formState.errors.confirm ? (
              <p className="auth-error">
                {accountForm.formState.errors.confirm.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={accountForm.formState.isSubmitting || otpState.sent}
            className="auth-btn group"
          >
            {accountForm.formState.isSubmitting
              ? t("auth.register.pleaseWait")
              : otpState.sent
                ? t("auth.register.otpSentBadge")
                : t("common.continue")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          {otpState.sent ? (
            <div className="space-y-3 border border-[var(--auth-line)] bg-[var(--auth-paper)] p-4">
              <p className="text-xs text-[var(--auth-muted)]">
                {t("auth.register.otpHint")} <b>{otpState.email}</b>.{" "}
                {t("auth.register.otpHintSuffix")}
              </p>
              <input
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="auth-field auth-otp"
                placeholder={t("auth.register.otpPlaceholder")}
                maxLength={6}
                inputMode="numeric"
                aria-label={t("auth.register.otpPlaceholder")}
              />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={onVerifyOtp} className="auth-btn">
                  {t("auth.register.verifyOtp")}
                </button>
                <button type="button" onClick={resendOtp} className="auth-btn-ghost">
                  {t("auth.forgot.resendOtp")}
                </button>
              </div>
              <button
                type="button"
                onClick={clearOtpStep}
                className="w-full text-xs text-[var(--auth-muted)] underline hover:text-[var(--auth-ink)]"
              >
                {t("auth.register.useDifferentEmail")}
              </button>
            </div>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-[var(--auth-muted)]">
          {t("auth.register.hasAccount")}{" "}
          <Link to="/login" className="auth-link">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (userDoc?.role === "admin" && !userDoc.storeId) {
    return (
      <AuthShell
        brandBadge={t("auth.register.panelStore")}
        brandTitle={t("auth.register.storePanelTitle")}
        brandDesc={t("auth.register.storePanelDesc")}
        features={[
          {
            icon: Store,
            title: t("auth.register.storeIdentityTitle"),
            desc: t("auth.register.storeIdentityDesc"),
          },
          {
            icon: ReceiptText,
            title: t("auth.register.billingReadyTitle"),
            desc: t("auth.register.billingReadyDesc"),
          },
          {
            icon: MapPin,
            title: t("auth.register.customerFacingTitle"),
            desc: t("auth.register.customerFacingDesc"),
          },
        ]}
      >
        <div className="mb-6 flex gap-2">
          <span className="border border-[var(--auth-line)] bg-[var(--auth-paper)] px-3 py-1 text-xs font-semibold text-[var(--auth-muted)]">
            {t("auth.register.badgeAccount")}
          </span>
          <span className="bg-[var(--auth-signal)] px-3 py-1 text-xs font-semibold text-white">
            {t("auth.register.badgeStore")}
          </span>
        </div>

        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--auth-muted)]">
              {t("auth.register.storeFormLabel")}
            </p>
            <h1 className="auth-display mt-2 text-3xl font-semibold text-[var(--auth-ink)]">
              {t("auth.register.storeFormTitle")}
            </h1>
          </div>
          <span className="auth-icon">
            <BadgeCheck className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <form onSubmit={onStore} className="space-y-4">
          <div>
            <label className="auth-label" htmlFor="store-name">
              {t("auth.register.storeName")}
            </label>
            <input
              id="store-name"
              autoComplete="organization"
              className="auth-field"
              {...storeForm.register("storeName", {
                required: t("auth.register.storeNameRequired"),
              })}
            />
            {storeForm.formState.errors.storeName ? (
              <p className="auth-error">
                {storeForm.formState.errors.storeName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="auth-label" htmlFor="store-address">
              {t("auth.register.storeAddress")}
            </label>
            <textarea
              id="store-address"
              rows={2}
              autoComplete="street-address"
              className="auth-field"
              {...storeForm.register("address", {
                required: t("auth.register.addressRequired"),
              })}
            />
            {storeForm.formState.errors.address ? (
              <p className="auth-error">
                {storeForm.formState.errors.address.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="auth-label" htmlFor="store-phone">
                {t("auth.register.storePhone")}
              </label>
              <div className="auth-field-wrap">
                <ShieldCheck className="h-4 w-4 text-[var(--auth-muted)]" aria-hidden />
                <input
                  id="store-phone"
                  type="tel"
                  autoComplete="tel"
                  className="w-full bg-transparent text-sm outline-none"
                  {...storeForm.register("phone", {
                    required: t("auth.register.phoneRequired"),
                  })}
                />
              </div>
              {storeForm.formState.errors.phone ? (
                <p className="auth-error">
                  {storeForm.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="auth-label" htmlFor="store-email">
                {t("auth.register.storeEmail")}
              </label>
              <div className="auth-field-wrap">
                <ArrowRight className="h-4 w-4 rotate-45 text-[var(--auth-muted)]" aria-hidden />
                <input
                  id="store-email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-transparent text-sm outline-none"
                  {...storeForm.register("storeEmail")}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="auth-label" htmlFor="store-currency">
              {t("auth.register.currency")}
            </label>
            <input
              type="hidden"
              {...storeForm.register("currency", {
                required: t("auth.register.currencyRequired"),
              })}
            />
            <SearchableSelect
              className="mt-0"
              value={storeForm.watch("currency")}
              onChange={(value) =>
                storeForm.setValue("currency", value, {
                  shouldValidate: true,
                })
              }
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code} (${getCurrencySymbol(c.code)}) - ${c.label}`,
              }))}
              placeholder={t("auth.register.currency")}
            />
            {storeForm.formState.errors.currency ? (
              <p className="auth-error">
                {storeForm.formState.errors.currency.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="auth-label" htmlFor="store-gst">
              {t("auth.register.gstNumber")}
            </label>
            <input
              id="store-gst"
              className="auth-field"
              {...storeForm.register("gstNumber")}
            />
          </div>
          <button
            type="submit"
            disabled={storeForm.formState.isSubmitting}
            className="auth-btn group"
          >
            {storeForm.formState.isSubmitting
              ? t("auth.register.creatingStore")
              : t("auth.register.complete")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </form>
      </AuthShell>
    );
  }

  return <Navigate to="/pos" replace />;
}
