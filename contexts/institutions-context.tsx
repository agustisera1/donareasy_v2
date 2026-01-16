"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Institution } from "@/lib/types";
import { useInstitutions } from "@/hooks/use-institutions";

interface InstitutionsContextType {
  // Institutions data
  institutions: Institution[];
  loading: boolean;
  refetch: () => Promise<void>;

  // Drawer states
  viewDrawerOpen: boolean;

  // Selected institution
  selectedInstitution: Institution | null;

  // Drawer actions
  openViewDrawer: (institution: Institution) => void;
  closeViewDrawer: () => void;
}

const InstitutionsContext = createContext<InstitutionsContextType | undefined>(
  undefined
);

export function InstitutionsProvider({ children }: { children: React.ReactNode }) {
  // Hooks
  const { institutions, loading, refetch } = useInstitutions();

  // Drawer states
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(
    null
  );

  // Drawer actions
  const openViewDrawer = useCallback((institution: Institution) => {
    setSelectedInstitution(institution);
    setViewDrawerOpen(true);
  }, []);

  const closeViewDrawer = useCallback(() => {
    setViewDrawerOpen(false);
    setSelectedInstitution(null);
  }, []);

  return (
    <InstitutionsContext.Provider
      value={{
        institutions,
        loading,
        refetch,
        viewDrawerOpen,
        selectedInstitution,
        openViewDrawer,
        closeViewDrawer,
      }}
    >
      {children}
    </InstitutionsContext.Provider>
  );
}

export function useInstitutionsContext() {
  const context = useContext(InstitutionsContext);
  if (context === undefined) {
    throw new Error(
      "useInstitutionsContext must be used within an InstitutionsProvider"
    );
  }
  return context;
}
