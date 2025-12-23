"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Campaign } from "@/lib/types";
import { InstitutionData } from "@/app/api/user/route";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useUser } from "@/hooks/use-user";

interface CampaignsContextType {
  // Campaigns data
  campaigns: Campaign[];
  loading: boolean;
  refetch: () => Promise<void>;

  // Institution data
  institution: InstitutionData | null;
  isInstitution: boolean;

  // Drawer states
  createDrawerOpen: boolean;
  editDrawerOpen: boolean;
  viewDrawerOpen: boolean;

  // AlertDialog state
  finishDialogOpen: boolean;

  // Selected campaign
  selectedCampaign: Campaign | null;

  // Drawer actions
  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  openEditDrawer: (campaign: Campaign) => void;
  closeEditDrawer: () => void;
  openViewDrawer: (campaign: Campaign) => void;
  closeViewDrawer: () => void;

  // AlertDialog actions
  openFinishDialog: (campaign: Campaign) => void;
  closeFinishDialog: () => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(
  undefined
);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  // Hooks
  const { user, loading: loadingUser } = useUser();
  const { campaigns, loading: loadingCampaigns, refetch } = useCampaigns();

  // Institution check
  const isInstitution = user?.role === "institution";
  const institution = isInstitution ? (user as InstitutionData) : null;

  // Drawer states
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // Drawer actions
  const openCreateDrawer = useCallback(() => {
    setCreateDrawerOpen(true);
  }, []);

  const closeCreateDrawer = useCallback(() => {
    setCreateDrawerOpen(false);
  }, []);

  const openEditDrawer = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditDrawerOpen(true);
  }, []);

  const closeEditDrawer = useCallback(() => {
    setEditDrawerOpen(false);
    setSelectedCampaign(null);
  }, []);

  const openViewDrawer = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewDrawerOpen(true);
  }, []);

  const closeViewDrawer = useCallback(() => {
    setViewDrawerOpen(false);
    setSelectedCampaign(null);
  }, []);

  // AlertDialog actions
  const openFinishDialog = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFinishDialogOpen(true);
  }, []);

  const closeFinishDialog = useCallback(() => {
    setFinishDialogOpen(false);
    setSelectedCampaign(null);
  }, []);

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        loading: loadingCampaigns || loadingUser,
        refetch,
        institution,
        isInstitution,
        createDrawerOpen,
        editDrawerOpen,
        viewDrawerOpen,
        finishDialogOpen,
        selectedCampaign,
        openCreateDrawer,
        closeCreateDrawer,
        openEditDrawer,
        closeEditDrawer,
        openViewDrawer,
        closeViewDrawer,
        openFinishDialog,
        closeFinishDialog,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaignsContext() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error(
      "useCampaignsContext must be used within a CampaignsProvider"
    );
  }
  return context;
}
