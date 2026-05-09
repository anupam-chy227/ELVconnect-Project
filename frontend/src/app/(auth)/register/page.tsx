import Link from "next/link";
import { BriefcaseBusiness, ShieldCheck, Sparkles, UserRound } from "lucide-react";

const roleCards = [
  {
    href: "/register/client",
    title: "Are you a client?",
    detail: "Post a project and search verified ELV vendors and engineering teams.",
    icon: UserRound,
    markIcon: ShieldCheck,
  },
  {
    href: "/register/vendor-engineer",
    title: "Are you a vendor / engineer?",
    detail: "Make money by completing verified ELV projects.",
    icon: BriefcaseBusiness,
    markIcon: Sparkles,
  },
];

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(99,91,255,0.34),transparent_28rem),radial-gradient(circle_at_84%_12%,rgba(14,165,233,0.18),transparent_22rem),linear-gradient(135deg,#080b16_0%,#111827_48%,#1e1b4b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center">
        <div>
          <div className="max-w-5xl">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/35 bg-white/10 px-4 py-2 text-xs font-black uppercase text-sky-100 shadow-sm backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4 text-sky-200" aria-hidden="true" />
                Secure registration
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-white/10 px-4 py-2 text-xs font-black uppercase text-emerald-100 shadow-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                Trust-first platform
              </span>
            </div>

            <h1
              className="mt-9 max-w-5xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl"
              style={{ color: "#ffffff", textShadow: "0 2px 28px rgba(255,255,255,0.18)" }}
            >
              Create the right workspace for secure ELV execution.
            </h1>
            <p className="mt-6 max-w-4xl text-lg font-semibold leading-8 text-indigo-100/88">
              Choose whether you are hiring trusted vendors or earning through verified engineering work, then complete the account details for your role.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {roleCards.map((card) => {
            const Icon = card.icon;
            const MarkIcon = card.markIcon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative min-h-[250px] overflow-hidden rounded-md border border-sky-100/80 bg-white p-8 text-left text-[#050617] shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-primary hover:shadow-primary/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/50"
              >
                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 -translate-y-10 translate-x-10 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-md bg-[#050617] text-white shadow-lg transition group-hover:bg-primary">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 bg-primary-subtle text-primary shadow-sm">
                    <MarkIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="relative z-20 mt-8 max-w-xl">
                  <h2 className="text-3xl font-black leading-tight tracking-tight text-black" style={{ color: "#050617" }}>
                    {card.title}
                  </h2>
                  <p className="mt-2 block max-w-lg text-[15px] font-black leading-6 text-black" style={{ color: "#050617" }}>
                    {card.detail}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
