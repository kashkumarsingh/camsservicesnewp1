import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Auth - CAMS Universal Dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}

