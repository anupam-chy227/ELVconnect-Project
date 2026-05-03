"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { ApiClientError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ZodError } from "zod";

const trustStats = [
  { label: "2,400+ Verified Engineers", icon: UsersRound },
  { label: "8,000+ Projects Completed", icon: CheckCircle2 },
  { label: "99.2% Compliance Rate", icon: ShieldCheck },
];

function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-danger">
      <AlertCircle className="h-3.5 w-3.5" />
      {error}
    </p>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-3 flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-sm font-bold text-danger">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function AuthLoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(undefined);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData.email, validatedData.password);
      toast.success("Welcome back!");
    } catch (error) {
      if (error instanceof ZodError) {
        const nextErrors: Partial<LoginFormData> = {};
        error.errors.forEach((item) => {
          const field = item.path[0] as keyof LoginFormData;
          nextErrors[field] = item.message;
        });
        setErrors(nextErrors);
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
    <main className="min-h-screen bg-white text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative flex min-h-[560px] overflow-hidden bg-gradient-to-br from-elv-indigo via-elv-violet to-elv-purple px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_18rem),radial-gradient(circle_at_78%_30%,rgba(14,165,233,0.18),transparent_20rem)]" />
          <div className="relative flex w-full flex-col">
            <Link href="/" className="inline-flex items-center gap-3 self-start" aria-label="ELV Connect home">
              <span className="grid h-14 w-14 place-items-center rounded-lg border border-white/20 bg-white/12 text-lg font-black text-white shadow-xl backdrop-blur-xl">
                ELV
              </span>
              <span className="text-3xl font-black tracking-tight text-white">ELV Connect</span>
            </Link>

            <div className="my-auto max-w-xl py-12">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-100">Secure marketplace access</p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                India&apos;s Trusted ELV Execution Platform
              </h1>

              <div className="mt-8 grid gap-3">
                {trustStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-md border border-white/12 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-elv-violet">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-black text-white">{stat.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-white/16 bg-white/12 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80"
                  alt="Amit Verma"
                  className="h-14 w-14 shrink-0 rounded-full border border-white/30 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">Amit Verma</p>
                  <p className="text-xs font-semibold text-indigo-100">Operations Head, SecureGrid Infra</p>
                  <p className="mt-3 text-sm leading-6 text-white/86">
                    &quot;ELV Connect helped us find verified engineers faster and keep every site milestone compliant.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-foreground">Email</span>
                <span className="group relative block">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@company.com"
                    disabled={isSubmitting}
                    className={cn(
                      "min-h-12 w-full rounded-md border bg-white py-3 pl-11 pr-4 text-sm font-semibold text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:shadow-focus",
                      errors.email ? "border-danger" : "border-border-subtle",
                    )}
                  />
                </span>
                <FieldError error={errors.email} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-foreground">Password</span>
                <span className="group relative block">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className={cn(
                      "min-h-12 w-full rounded-md border bg-white py-3 pl-11 pr-12 text-sm font-semibold text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:shadow-focus",
                      errors.password ? "border-danger" : "border-border-subtle",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
                <FieldError error={errors.password} />
              </label>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-bold text-primary transition hover:text-secondary">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              >
                Sign in
              </Button>
              <FormError message={formError} />
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-bold text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleAuthButton
              label="Continue with Google"
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-border-subtle bg-white px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-black text-primary transition hover:text-secondary">
                Register
              </Link>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1">
                <LockKeyhole className="h-3.5 w-3.5 text-success" />
                256-bit encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                SOC2
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
