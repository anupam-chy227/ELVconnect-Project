import { LoginForm } from "@/components/Auth/LoginForm";
import { Activity, BadgeCheck, LockKeyhole, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const trustBadges = [
  { label: "Secure login", icon: LockKeyhole },
  { label: "Verified platform", icon: BadgeCheck },
  { label: "Pan-India network", icon: MapPin },
];

function ELVIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/24 via-sky-400/14 to-emerald-400/14 blur-3xl" />
      <div className="premium-glass absolute inset-x-8 top-8 rounded-md p-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div>
            <div className="h-2 w-20 rounded-full bg-white/70" />
            <div className="mt-2 h-2 w-12 rounded-full bg-indigo-200/70" />
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-400/16 text-emerald-200 ring-1 ring-emerald-300/20">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {["w-[82%]", "w-[64%]", "w-[92%]"].map((widthClassName, index) => (
            <div key={widthClassName} className="rounded-md border border-white/10 bg-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${index === 1 ? "bg-sky-300" : "bg-emerald-300"}`} />
                <div className={`h-2 rounded-full bg-white/60 ${widthClassName}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-0 w-44 rounded-md border border-white/14 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <Activity className="h-4 w-4 text-sky-300" />
          Live jobs
        </div>
        <p className="mt-3 font-mono text-3xl font-black text-white">42</p>
        <p className="text-xs text-indigo-100">active security projects</p>
      </div>
      <div className="absolute bottom-0 right-4 w-48 rounded-md border border-white/14 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <LockKeyhole className="h-4 w-4 text-emerald-300" />
          UPI protected
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300" />
        </div>
        <p className="mt-2 text-xs text-indigo-100">milestone payment ready</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(99,91,255,0.34),transparent_28rem),radial-gradient(circle_at_84%_12%,rgba(14,165,233,0.18),transparent_22rem),linear-gradient(135deg,#080b16_0%,#111827_48%,#1e1b4b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-6">
        <section className="flex items-center justify-center lg:justify-start">
          <div className="w-full max-w-[480px]">
            <div className="mb-6 text-center lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-black uppercase text-indigo-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure ELV access
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-sky-50">ELV Connect</h1>
              <p className="mt-2 text-sm text-indigo-100/80">Verified marketplace authentication</p>
            </div>
            <LoginForm />
          </div>
        </section>

        <section className="hidden min-h-[680px] flex-col justify-between rounded-md border border-white/10 bg-white/[0.055] p-8 shadow-2xl backdrop-blur-2xl lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-black uppercase text-indigo-100">
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              ELV Connect enterprise access
            </div>
            <h1 className="mt-7 max-w-xl text-5xl font-black leading-[1.04] tracking-tight drop-shadow-[0_2px_18px_rgba(203,213,225,0.28)]" style={{ color: "#cbd5e1" }}>
              Secure infrastructure work starts with a verified login.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-indigo-100/82">
              Sign in to manage ELV jobs, engineers, UPI-ready payments, city coverage, and trusted project follow-ups from one premium marketplace console.
            </p>
          </div>

          <ELVIllustration />

          <div className="grid grid-cols-3 gap-3">
            {trustBadges.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
                  <Icon className="h-4 w-4 text-indigo-200" />
                  <p className="mt-2 text-xs font-black text-white">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
