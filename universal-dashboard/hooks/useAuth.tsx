"use client";

import React, { createContext, useContext, useState } from "react";

type Role = "parent" | "trainer" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = (email: string) => {
    const domain = email.split("@")[1] ?? "";
    const role: Role =
      domain === "trainer.example.com"
        ? "trainer"
        : domain === "admin.example.com"
          ? "admin"
          : "parent";

    setUser({
      name: "Signed-in user",
      email,
      role,
    });
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
