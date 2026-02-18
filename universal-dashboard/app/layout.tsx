import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/hooks/useAuth";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CAMS Universal Dashboard",
  description:
    "Universal, role-based dashboard scaffold for parents, trainers and admins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

