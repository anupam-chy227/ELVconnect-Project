export type ToastType = "success" | "error" | "warning" | "info";

export type ToastRecord = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
};

type ToastListener = () => void;
type ToastOptions = {
  id?: string;
  duration?: number;
};

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE_TOASTS = 3;

let toastCounter = 0;
let toasts: ToastRecord[] = [];
const listeners = new Set<ToastListener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function createToast(type: ToastType, message: string, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${Date.now()}-${toastCounter++}`;
  const nextToast: ToastRecord = {
    id,
    type,
    message,
    duration: options.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
  };

  toasts = [...toasts.filter((item) => item.id !== id), nextToast].slice(-MAX_VISIBLE_TOASTS);
  emit();
  return id;
}

export const toast = {
  success: (message = "Engineer verified successfully", options?: ToastOptions) =>
    createToast("success", message, options),
  error: (message = "Payment failed. Try again.", options?: ToastOptions) =>
    createToast("error", message, options),
  warning: (message = "Job expires in 2 hours", options?: ToastOptions) =>
    createToast("warning", message, options),
  info: (message = "New application received", options?: ToastOptions) =>
    createToast("info", message, options),
  show: createToast,
  dismiss: (id: string) => {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
  },
  clear: () => {
    toasts = [];
    emit();
  },
  subscribe: (listener: ToastListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
};

export const toastConfig = {
  defaultDuration: DEFAULT_DURATION,
  maxVisibleToasts: MAX_VISIBLE_TOASTS,
};
