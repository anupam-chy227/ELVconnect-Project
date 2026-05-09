"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { ApiClientError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui";
import { AlertCircle, ArrowRight, CreditCard, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { ZodError } from "zod";

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-3 flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-sm font-bold text-danger">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      {message}
    </p>
  );
}

export function LoginForm() {
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(undefined);
    // Clear error for this field
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      const validatedData = loginSchema.parse(formData);

      await login(validatedData.email, validatedData.password);
      toast.success("Welcome back!");
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation errors
        const formErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
            const field = err.path[0] as keyof LoginFormData;
            formErrors[field] = err.message;
          });
        setErrors(formErrors);
      } else if (error instanceof ApiClientError) {
        setFormError(error.message);
        toast.error(error.status ? error.message : "Cannot connect. Please try again.");
      } else {
        setFormError("Cannot connect. Please try again.");
        toast.error("Cannot connect. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full">
      <div className="rounded-md border border-white/70 bg-white/92 p-7 shadow-2xl shadow-indigo-950/18 backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-950/88">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-[11px] font-black uppercase text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure ELV access
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-success-subtle px-3 py-1 text-[11px] font-black uppercase text-success">
            <Sparkles className="h-3.5 w-3.5" />
            Verified platform
          </span>
        </div>
        <h1 className="mb-2 text-4xl font-black tracking-tight text-foreground">Welcome back</h1>
        <p className="mb-7 text-sm font-semibold leading-6" style={{ color: "#0b1f46" }}>
          Continue to your secure command center for jobs, engineers, payments, and project follow-up.
        </p>

        <GoogleAuthButton
          label="Continue with Google"
          className="group flex w-full items-center justify-center gap-3 rounded-md border border-border-subtle bg-white px-4 py-3 text-sm font-black text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-subtle hover:text-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900"
        />

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-xs font-semibold text-muted-foreground dark:bg-slate-950">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-black text-foreground">
              Email Address
            </label>
            <div className="group relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground transition group-focus-within:text-primary" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`min-h-12 w-full rounded-md border bg-surface py-3 pl-11 pr-4 text-foreground shadow-sm transition-all placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:shadow-focus ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-border-subtle"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-black text-foreground">
              Password
            </label>
            <div className="group relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground transition group-focus-within:text-primary" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`min-h-12 w-full rounded-md border bg-surface py-3 pl-11 pr-4 text-foreground shadow-sm transition-all placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:shadow-focus ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-border-subtle"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.password && (
              <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /> : null}
          >
            Sign In
          </Button>
          <FormError message={formError} />
        </form>

        <div className="relative mt-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-xs font-semibold text-muted-foreground dark:bg-slate-950">Need a manual account?</span>
          </div>
        </div>

        <p className="mt-6 text-center">
          <a
            href="/register"
            className="font-bold transition-colors hover:opacity-80"
            style={{ color: "#0b1f46" }}
          >
            Create an account
          </a>
        </p>
      </div>

      <div className="mt-5 rounded-md border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/80">
        <p className="flex items-start gap-2 text-sm text-foreground">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold">Demo Credentials:</span>
            <br />
            Email: test@example.com
            <br />
            Password: Demo@12345 (if available)
          </span>
        </p>
      </div>
    </div>
  );
}
