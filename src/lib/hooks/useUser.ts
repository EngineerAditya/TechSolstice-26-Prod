"use client";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

export function useUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    loading: status === "loading",
    session,
  };
}
