"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface ParentDashboardHeaderContextValue {
  centerTitle: string | null;
  setCenterTitle: (title: string | null) => void;
}

const ParentDashboardHeaderContext = createContext<ParentDashboardHeaderContextValue | null>(null);

export function ParentDashboardHeaderProvider({ children }: { children: React.ReactNode }) {
  const [centerTitle, setCenterTitleState] = useState<string | null>(null);
  const setCenterTitle = useCallback((title: string | null) => {
    setCenterTitleState(title);
  }, []);
  return (
    <ParentDashboardHeaderContext.Provider value={{ centerTitle, setCenterTitle }}>
      {children}
    </ParentDashboardHeaderContext.Provider>
  );
}

export function useParentDashboardHeader() {
  const ctx = useContext(ParentDashboardHeaderContext);
  return ctx;
}
