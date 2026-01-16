"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Institution } from "@/lib/types";
import { useInstitutions } from "@/hooks/use-institutions";
import { InstitutionData } from "@/app/api/user/route";
import { useUser } from "@/hooks/use-user";

interface InstitutionsContextType {
  // Institutions data
  institutions: Institution[];
  loading: boolean;
  refetch: () => Promise<void>;

  // User data
  institution: InstitutionData | null;
  isInstitution: boolean;

  // Drawer states
  viewDrawerOpen: boolean;
  metricsDrawerOpen: boolean;

  // Selected institution
  selectedInstitution: Institution | null;

  // Drawer actions
  openViewDrawer: (institution: Institution) => void;
  closeViewDrawer: () => void;
  openMetricsDrawer: (institution: Institution) => void;
  closeMetricsDrawer: () => void;
}

const InstitutionsContext = createContext<InstitutionsContextType | undefined>(
  undefined
);

export function InstitutionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hooks
  const { user } = useUser();
  const { institutions, loading, refetch } = useInstitutions();

  // Institution check
  const isInstitution = user?.role === "institution";
  const institution = isInstitution ? (user as InstitutionData) : null;

  // Filtrar institución propia si el usuario es institution
  const filteredInstitutions = useMemo(() => {
    if (isInstitution && institution?.id) {
      return institutions.filter((inst) => inst.id !== institution.id);
    }
    return institutions;
  }, [institutions, isInstitution, institution]);

  // Drawer states
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [metricsDrawerOpen, setMetricsDrawerOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  // Drawer actions
  const openViewDrawer = useCallback((institution: Institution) => {
    setSelectedInstitution(institution);
    setViewDrawerOpen(true);
  }, []);

  const closeViewDrawer = useCallback(() => {
    setViewDrawerOpen(false);
    setSelectedInstitution(null);
  }, []);

  const openMetricsDrawer = useCallback((institution: Institution) => {
    setSelectedInstitution(institution);
    setMetricsDrawerOpen(true);
  }, []);

  const closeMetricsDrawer = useCallback(() => {
    setMetricsDrawerOpen(false);
    setSelectedInstitution(null);
  }, []);

  return (
    <InstitutionsContext.Provider
      value={{
        institutions: filteredInstitutions,
        loading,
        refetch,
        institution,
        isInstitution,
        viewDrawerOpen,
        metricsDrawerOpen,
        selectedInstitution,
        openViewDrawer,
        closeViewDrawer,
        openMetricsDrawer,
        closeMetricsDrawer,
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
