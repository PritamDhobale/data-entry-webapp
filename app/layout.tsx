import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleProvider } from "@/context/role-context"; // ✅ added

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MySage - InputHub",
  description: "Company Data Entry Web Application for Sage Healthy",
  icons: {
    icon: "/images/p.png",
  },
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <RoleProvider> {/* ✅ new context wrapper */}
              <ProtectedRoute>{children}</ProtectedRoute>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
