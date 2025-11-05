"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation"; // ✅ correct import

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login"); // redirect to login
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null; // optional: show spinner or loading UI here
  }

  return null;
};
