"use client";

import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 2,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
