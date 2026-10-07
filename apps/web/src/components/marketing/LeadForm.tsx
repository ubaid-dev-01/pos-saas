"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type FormValues = {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  message?: string;
};

export function LeadForm({ source = "website" }: { source?: string }) {
  const router = useRouter();
  const formId = useId();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed");
      }
      router.push("/thank-you");
    } catch (err) {
      const msg =
        err instanceof Error && err.message && err.message !== "Failed"
          ? err.message
          : "Something went wrong. Call or WhatsApp us—we’ll help you live.";
      setError(msg);
    }
  };

  const field =
    "w-full border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-signal";
  const errorId = `${formId}-form-error`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3"
      noValidate
      aria-describedby={error ? errorId : undefined}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium">
            Your name <span className="text-muted">(required)</span>
          </label>
          <input
            id={`${formId}-name`}
            className={field}
            aria-required="true"
            aria-invalid={!!errors.name}
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label
            htmlFor={`${formId}-businessName`}
            className="mb-1.5 block text-sm font-medium"
          >
            Business name <span className="text-muted">(required)</span>
          </label>
          <input
            id={`${formId}-businessName`}
            className={field}
            aria-required="true"
            aria-invalid={!!errors.businessName}
            {...register("businessName", { required: true })}
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-phone`} className="mb-1.5 block text-sm font-medium">
            Phone (WhatsApp) <span className="text-muted">(required)</span>
          </label>
          <input
            id={`${formId}-phone`}
            className={field}
            placeholder="3XX XXXXXXX"
            aria-required="true"
            aria-invalid={!!errors.phone}
            {...register("phone", { required: true })}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-email`} className="mb-1.5 block text-sm font-medium">
            Email <span className="text-muted">(required — for our 24h reply)</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            className={field}
            aria-required="true"
            aria-invalid={!!errors.email}
            {...register("email", { required: true })}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${formId}-message`} className="mb-1.5 block text-sm font-medium">
          What are you running today?
        </label>
        <textarea
          id={`${formId}-message`}
          rows={3}
          className={field}
          {...register("message")}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Talk to sales"}
      </Button>
    </form>
  );
}
