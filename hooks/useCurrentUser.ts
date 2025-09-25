"use client";

import { useEffect, useState } from "react";
import type { IUser } from "@/models/User";

export function useCurrentUser() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (active) {
          if (data.success) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("useCurrentUser error:", err);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
