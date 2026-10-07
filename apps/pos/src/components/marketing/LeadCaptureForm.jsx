import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";
import { MARKETING_IMAGES } from "../../constants/marketingImages";
import { submitLead } from "../../services/leadService";
import SearchableSelect from "../ui/SearchableSelect";
import MarketingImage from "./MarketingImage";

const FIELD_STYLE =
  "w-full border border-mkt-200 bg-white px-3 py-2.5 text-sm text-mkt-900 focus:outline-none focus:ring-2 focus:ring-mkt-indigo/30";

function ContactRow({ icon: Icon, title, primary, secondary, href, external }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-start gap-3 border border-white/15 bg-mkt-blue/40 p-4 text-white hover:bg-mkt-blue/55"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/75 uppercase">
          {title}
        </span>
        <span className="mt-1 block break-words text-sm font-semibold text-white">
          {primary}
        </span>
        <span className="mt-1 block text-xs text-white/80">{secondary}</span>
      </span>
    </a>
  );
}

export default function LeadCaptureForm({ source = "homepage-form" }) {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [emailResponse, setEmailResponse] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      preferredContact: "call",
      businessType: "",
      storeCount: "",
    },
  });
  const businessType = useWatch({ control, name: "businessType" }) || "";
  const storeCount = useWatch({ control, name: "storeCount" }) || "";

  const businessTypeOptions = useMemo(
    () => [
      { value: "", label: t("marketing.lead.businessType") },
      { value: "Retail", label: t("marketing.lead.businessTypeRetail") },
      { value: "Restaurant", label: t("marketing.lead.businessTypeRestaurant") },
      { value: "Salon", label: t("marketing.lead.businessTypeSalon") },
      { value: "Pharmacy", label: t("marketing.lead.businessTypePharmacy") },
      { value: "Grocery", label: t("marketing.lead.businessTypeGrocery") },
      { value: "Other", label: t("marketing.lead.businessTypeOther") },
    ],
    [t],
  );

  const storeCountOptions = useMemo(
    () => [
      { value: "", label: t("marketing.lead.storeCount") },
      "1",
      "2-5",
      "5-10",
      "10+",
    ],
    [t],
  );

  const onSubmit = async (values) => {
    try {
      const result = await submitLead({
        name: values.name,
        businessName: values.businessName,
        phone: `+92 ${values.phone}`,
        email: values.email || null,
        businessType: values.businessType,
        storeCount: values.storeCount,
        message: values.message || "",
        preferredContact: values.preferredContact,
        source,
      });
      setEmailResponse(
        result?.emailResponse
          ? {
              status: result.emailResponse.status,
              text: result.emailResponse.text,
            }
          : result?.emailError
            ? { status: "error", text: result.emailError }
            : null,
      );
      setSuccess(true);
      if (result?.emailResponse) {
        toast.success(
          t("marketing.lead.emailJsToast", {
            status: result.emailResponse.status,
            text: result.emailResponse.text,
          }),
        );
      } else if (result?.emailError) {
        toast.success(t("marketing.lead.leadSaved"));
        toast.error(result.emailError);
      } else {
        toast.success(t("marketing.lead.submitSuccess"));
      }
      reset();
      navigate("/thank-you", {
        state: {
          name: values.name,
          businessName: values.businessName,
          leadId: result?.leadId,
          emailStatus: result?.emailResponse ? "notified" : "saved",
          emailMessage:
            result?.emailResponse?.text ||
            result?.emailError ||
            t("marketing.lead.leadSubmitted"),
          source,
        },
      });
    } catch (error) {
      toast.error(error?.message || t("marketing.lead.submitFailed"));
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white border border-border p-6">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              className={FIELD_STYLE}
              placeholder={t("marketing.lead.name")}
              {...register("name", { required: t("marketing.lead.nameRequired") })}
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <input
              className={FIELD_STYLE}
              placeholder={t("marketing.lead.businessName")}
              {...register("businessName", {
                required: t("marketing.lead.businessRequired"),
              })}
            />
            {errors.businessName && (
              <p className="text-xs text-error mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>
          <div>
            <div className="flex rounded-md border border-border overflow-hidden">
              <span className="px-3 bg-background text-sm grid place-items-center">
                +92
              </span>
              <input
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                placeholder={t("marketing.lead.phonePlaceholder")}
                {...register("phone", {
                  required: t("marketing.lead.phoneRequiredMsg"),
                  minLength: 10,
                })}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-error mt-1">
                {t("marketing.lead.phoneRequired")}
              </p>
            )}
          </div>
          <input
            className={FIELD_STYLE}
            placeholder={t("marketing.lead.emailOptional")}
            type="email"
            {...register("email")}
          />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <input
                type="hidden"
                {...register("businessType", { required: true })}
              />
              <SearchableSelect
                inputId="lead-business-type"
                aria-label={t("marketing.lead.businessType")}
                value={businessType}
                onChange={(value) =>
                  setValue("businessType", value, { shouldValidate: true })
                }
                options={businessTypeOptions}
                placeholder={t("marketing.lead.businessType")}
                allowCustomOption
              />
            </div>
            <div>
              <input
                type="hidden"
                {...register("storeCount", { required: true })}
              />
              <SearchableSelect
                inputId="lead-store-count"
                aria-label={t("marketing.lead.storeCount")}
                value={storeCount}
                onChange={(value) =>
                  setValue("storeCount", value, { shouldValidate: true })
                }
                options={storeCountOptions}
                placeholder={t("marketing.lead.storeCount")}
                allowCustomOption
              />
            </div>
          </div>
          <textarea
            className={FIELD_STYLE}
            rows={4}
            placeholder={t("marketing.lead.message")}
            {...register("message")}
          />

          <div className="text-sm">
            <p className="font-medium mb-2">{t("marketing.lead.preferredContact")}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <label>
                <input
                  type="radio"
                  value="call"
                  {...register("preferredContact")}
                />{" "}
                {t("marketing.lead.contactCall")}
              </label>
              <label>
                <input
                  type="radio"
                  value="whatsapp"
                  {...register("preferredContact")}
                />{" "}
                {t("marketing.lead.contactWhatsapp")}
              </label>
              <label>
                <input
                  type="radio"
                  value="email"
                  {...register("preferredContact")}
                />{" "}
                {t("marketing.lead.contactEmail")}
              </label>
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              className="mt-0.5"
              {...register("agree", { required: true })}
            />
            {t("marketing.lead.agreeTerms")}
          </label>
          {errors.agree && (
            <p className="text-xs text-error">{t("marketing.lead.agreeRequired")}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mkt-btn mkt-btn-primary w-full"
          >
            {isSubmitting ? t("marketing.lead.submitting") : t("marketing.lead.submit")}
          </button>

          {success && (
            <p className="text-center text-sm font-medium text-mkt-indigo">
              {t("marketing.lead.successInline")}
            </p>
          )}
          {emailResponse && (
            <p className="text-xs text-text-muted text-center">
              {t("marketing.lead.emailJsResponse", {
                status: emailResponse.status,
                text: emailResponse.text,
              })}
            </p>
          )}
        </form>
      </div>

      <div className="flex flex-col overflow-hidden border border-mkt-100 bg-mkt-navy text-white">
        <MarketingImage
          src={MARKETING_IMAGES.aboutStore}
          alt={t("marketing.lead.altStore")}
          className="h-36 w-full object-cover object-center sm:h-40"
          width={900}
          height={400}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 420px"
        />

        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          <div>
            <p className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white/85 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> {t("marketing.lead.talkToSales")}
            </p>
            <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
              {t("marketing.lead.preferDirect")}
            </h3>
            <p className="mt-2 text-sm text-white/85">
              {t("marketing.lead.preferDirectDesc")}
            </p>
          </div>

          <div className="grid gap-2.5">
            <ContactRow
              icon={Phone}
              title={t("marketing.lead.callUs")}
              primary={QUICKPOS_CONTACT.phoneDisplay}
              secondary={t("marketing.lead.callHours")}
              href={QUICKPOS_CONTACT.phoneLink}
            />
            <ContactRow
              icon={MessageCircle}
              title={t("common.whatsapp")}
              primary={QUICKPOS_CONTACT.phoneDisplay}
              secondary={t("marketing.lead.whatsappInstant")}
              href={QUICKPOS_CONTACT.whatsappDemo}
              external
            />
            <ContactRow
              icon={Mail}
              title={t("common.email")}
              primary={QUICKPOS_CONTACT.email}
              secondary={t("marketing.lead.emailResponse")}
              href={`mailto:${QUICKPOS_CONTACT.email}`}
            />
          </div>

          <div className="flex items-start gap-3 border border-white/15 bg-mkt-blue/40 p-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 text-white">
              <MapPin className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                {t("marketing.lead.office")}
              </span>
              <span className="mt-1 block text-sm text-white">
                {QUICKPOS_CONTACT.office}
              </span>
              <span className="mt-1 inline-flex items-center gap-2 text-xs text-white/80">
                <Clock3 className="h-3.5 w-3.5" /> {t("marketing.lead.fastResponse")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
