import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import LoadingScreen from "../components/ui/LoadingScreen";
import PasswordInput from "../components/ui/PasswordInput";
import { useTranslation } from "../context/LocaleContext";
import useAuthStore from "../stores/authStore";

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, userDoc, login, authHydrated } = useAuthStore();
  const [forgotOpen, setForgotOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  if (!authHydrated) return <LoadingScreen />;

  if (user && userDoc) {
    if (userDoc.role === "superadmin")
      return <Navigate to="/super-admin" replace />;
    if (userDoc.role === "admin" && !userDoc.storeId)
      return <Navigate to="/register?step=store" replace />;
    return <Navigate to="/pos" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success(t("auth.login.signedIn"));
    } catch (e) {
      const map = {
        "auth/wrong-password": t("auth.login.wrongPassword"),
        "auth/user-not-found": t("auth.login.userNotFound"),
        "auth/invalid-credential": t("auth.login.invalidCredential"),
        "auth/invalid-email": t("auth.login.invalidEmail"),
        "permission-denied": t("auth.login.permissionDenied"),
      };
      toast.error(map[e?.code] || e?.message || t("auth.login.failed"));
    }
  };

  return (
    <>
      <AuthShell
        brandBadge={t("auth.login.badge")}
        brandTitle={t("auth.login.heroTitle")}
        brandDesc={t("auth.login.heroDesc")}
        features={[
          {
            icon: Zap,
            title: t("auth.login.featureFastTitle"),
            desc: t("auth.login.featureFastDesc"),
          },
          {
            icon: ShieldCheck,
            title: t("auth.login.featureSecureTitle"),
            desc: t("auth.login.featureSecureDesc"),
          },
          {
            icon: BadgeCheck,
            title: t("auth.login.featureLiveTitle"),
            desc: t("auth.login.featureLiveDesc"),
          },
        ]}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--auth-muted)]">
              {t("auth.login.formLabel")}
            </p>
            <h2 className="auth-display mt-2 text-2xl font-semibold text-[var(--auth-ink)]">
              {t("auth.login.formTitle")}
            </h2>
          </div>
          <span className="auth-icon">
            <LockKeyhole className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="auth-label" htmlFor="login-email">
              {t("auth.login.email")}
            </label>
            <div className="auth-field-wrap">
              <Mail className="h-4 w-4 shrink-0 text-[var(--auth-muted)]" aria-hidden />
              <input
                id="login-email"
                type="email"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--auth-muted)]"
                placeholder={t("auth.login.emailPlaceholder")}
                {...register("email", {
                  required: t("auth.login.emailRequired"),
                })}
              />
            </div>
            {errors.email ? (
              <p className="auth-error">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="auth-label mb-0" htmlFor="login-password">
                {t("auth.login.password")}
              </label>
              <span className="text-[11px] text-[var(--auth-muted)]">
                {t("auth.login.secureHint")}
              </span>
            </div>
            <PasswordInput
              id="login-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              wrapperClassName="auth-field-wrap !rounded-none border-[var(--auth-line)] bg-[var(--auth-surface)] focus-within:!ring-0 focus-within:border-[var(--auth-signal)]"
              {...register("password", {
                required: t("auth.login.passwordRequired"),
              })}
            />
            {errors.password ? (
              <p className="auth-error">{errors.password.message}</p>
            ) : null}
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-btn group">
            {isSubmitting ? t("auth.login.signingIn") : t("auth.login.submit")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="auth-link text-xs"
          >
            {t("auth.login.forgotPassword")}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--auth-muted)]">
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" className="auth-link">
            {t("auth.login.register")}
          </Link>
        </p>
      </AuthShell>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
