"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
            }
          ) => void;
        };
      };
    };
  }
}

type GoogleAuthButtonProps = {
  label?: string;
  role?: "customer" | "service_provider";
  mode?: "custom" | "official";
  className?: string;
  fallbackHref?: string;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";
let initializedClientId: string | null = null;
let activeCredentialHandler: ((credential: string) => void) | null = null;

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script failed to load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({
  label = "Continue with Google",
  role = "customer",
  mode = "custom",
  className,
  fallbackHref = "/login",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isReady, setIsReady] = useState(mode === "custom");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const officialButtonRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const promptHandledRef = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (mode === "custom") {
      return;
    }
    if (!clientId) return;

    let mounted = true;

    loadGoogleScript()
      .then(() => {
        if (!mounted || !window.google?.accounts?.id) return;

        activeCredentialHandler = async (credential) => {
          promptHandledRef.current = true;
          isSubmittingRef.current = true;
          setIsSubmitting(true);
          try {
            await loginWithGoogle(credential, role);
            markDashboardNavigationIntent();
            router.push("/dashboard");
          } finally {
            setIsSubmitting(false);
            isSubmittingRef.current = false;
          }
        };

        if (mode === "official" && initializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: ({ credential }) => {
              if (credential) activeCredentialHandler?.(credential);
            },
            cancel_on_tap_outside: true,
          });
          initializedClientId = clientId;
        }

        if (mode === "official" && officialButtonRef.current) {
          officialButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(officialButtonRef.current, {
            theme: "outline",
            size: "large",
            width: officialButtonRef.current.clientWidth || 360,
            text: "continue_with",
            shape: "rectangular",
          });
        }

        setIsReady(true);
      })
      .catch(() => setIsReady(false));

    return () => {
      mounted = false;
    };
  }, [clientId, loginWithGoogle, mode, role, router]);

  if (!clientId && mode === "official") {
    return null;
  }

  if (mode === "official") {
    return <div ref={officialButtonRef} className={className} />;
  }

  return (
    <button
      type="button"
      disabled={!isReady || isSubmitting}
      onClick={() => {
        if (apiBaseUrl) {
          window.location.href = `${apiBaseUrl}/auth/google/start?role=${role}`;
          return;
        }

        activeCredentialHandler = async (credential) => {
          promptHandledRef.current = true;
          isSubmittingRef.current = true;
          setIsSubmitting(true);
          try {
            await loginWithGoogle(credential, role);
            markDashboardNavigationIntent();
            router.push("/dashboard");
          } finally {
            setIsSubmitting(false);
            isSubmittingRef.current = false;
          }
        };
        promptHandledRef.current = false;
        if (clientId && window.google?.accounts.id && initializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: ({ credential }) => {
              if (credential) activeCredentialHandler?.(credential);
            },
            cancel_on_tap_outside: true,
          });
          initializedClientId = clientId;
        }
        window.google?.accounts.id.prompt();
        window.setTimeout(() => {
          if (!promptHandledRef.current && !isSubmittingRef.current) {
            if (apiBaseUrl) {
              window.location.href = `${apiBaseUrl}/auth/google/start?role=${role}`;
            } else {
              router.push(fallbackHref);
            }
          }
        }, 2500);
      }}
      className={
        className ||
        "flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-base font-bold text-blue-600">
        G
      </span>
      {isSubmitting ? "Signing in..." : label}
    </button>
  );
}
