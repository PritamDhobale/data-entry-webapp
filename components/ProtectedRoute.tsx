"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? ""; // ✅ ensures string, not null

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          // ✅ Safe includes() check
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push("/login");
          }
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push("/login");
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 🔁 Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !PUBLIC_ROUTES.includes(pathname)) {
        router.push("/login");
      } else if (session && pathname === "/login") {
        router.push("/");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground text-sm">
        Checking authentication...
      </div>
    );

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) return null;

  return <>{children}</>;
}
