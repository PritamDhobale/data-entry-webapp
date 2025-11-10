"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // ✅ use shared client

export type Role = "Admin" | "Reviewer" | "DataEntry";

const RoleContext = createContext<Role>("DataEntry");

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("DataEntry");

  useEffect(() => {
    let mounted = true;

    async function fetchRole() {
      try {
        // ✅ Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session || !session.user) {
          console.warn("⚠️ No active session found");
          return;
        }

        // ✅ Read role from user_metadata
        const metaRole =
          (session.user.user_metadata?.role as Role) || "DataEntry";

        if (mounted) {
          setRole(metaRole);
          console.log("🔹 RoleContext:", metaRole);
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch role:", err.message);
      }
    }

    fetchRole();

    // ✅ Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const metaRole = (session?.user?.user_metadata?.role as Role) || "DataEntry";
      setRole(metaRole);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
