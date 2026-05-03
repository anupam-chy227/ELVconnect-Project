import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
};

const avatarSizeClassNames: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, alt, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-elv-border bg-primary-subtle font-black text-primary shadow-sm dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-indigo-200",
        avatarSizeClassNames[size],
        className,
      )}
      aria-label={src ? undefined : alt ?? name}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}
