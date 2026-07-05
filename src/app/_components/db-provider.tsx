"use client";

// src/app/_components/db-provider.tsx
//
// InstantDB's React hooks don't require a provider — the client itself
// holds connection state. This wrapper exists so we have a single place
// to add future global state (auth toasts, etc.) without rewriting
// layout.tsx.

import type { ReactNode } from "react";

export function DBProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
