"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "./utils";

export type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label?: string;
  description?: string;
  files?: File[];
  error?: string;
  onFilesChange?: (files: File[]) => void;
};

export function FileUpload({ label = "Upload files", description, files = [], error, onFilesChange, className, ...props }: FileUploadProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFilesChange?.(Array.from(event.target.files ?? []));
  }

  return (
    <label className={cn("block rounded-lg border border-dashed bg-white p-4 text-center transition hover:border-primary dark:bg-slate-900", error ? "border-rose-300" : "border-slate-300 dark:border-slate-700", className)}>
      <input type="file" className="sr-only" onChange={handleChange} {...props} />
      <UploadCloud className="mx-auto h-6 w-6 text-primary" />
      <span className="mt-2 block text-sm font-bold text-slate-950 dark:text-slate-50">{label}</span>
      {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
      {files.length ? <span className="mt-2 block text-xs font-semibold text-primary">{files.length} file selected</span> : null}
      {error ? <span className="mt-2 block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}
