import { CreditCard, IndianRupee, Landmark, ShieldCheck, Smartphone } from "lucide-react";
import { cn } from "./utils";

export type PaymentTrustCardProps = {
  title?: string;
  amount?: string;
  method?: "upi" | "escrow" | "bank";
  status?: string;
  className?: string;
};

const methodCopy = {
  upi: {
    label: "UPI-first settlement",
    icon: Smartphone,
    className: "from-indigo-600 to-violet-600",
  },
  escrow: {
    label: "Milestone escrow guarded",
    icon: ShieldCheck,
    className: "from-emerald-600 to-teal-600",
  },
  bank: {
    label: "Bank transfer verified",
    icon: Landmark,
    className: "from-sky-600 to-indigo-600",
  },
};

export function PaymentTrustCard({
  title = "Secure payment rail",
  amount = "UPI ready",
  method = "upi",
  status = "Protected by milestone proof",
  className,
}: PaymentTrustCardProps) {
  const methodMeta = methodCopy[method];
  const Icon = methodMeta.icon;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-md border border-border-subtle bg-surface shadow-card",
        className,
      )}
    >
      <div className={cn("bg-gradient-to-br p-4 text-white", methodMeta.className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-white/80">{title}</p>
            <p className="mt-2 text-2xl font-black">{amount}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15 ring-1 ring-white/20">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-muted px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-black text-foreground">
            <IndianRupee className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {methodMeta.label}
          </span>
          <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
        </div>
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {status}
        </p>
      </div>
    </article>
  );
}
