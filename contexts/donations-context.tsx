"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Donation } from "@/lib/types";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import { useDonations } from "@/hooks/use-donations";
import { useUser } from "@/hooks/use-user";

interface DonationsContextType {
  // Donations data
  donations: Donation[];
  loading: boolean;
  refetch: () => Promise<void>;

  // User data
  donor: DonorData | null;
  institution: InstitutionData | null;
  isDonor: boolean;
  isInstitution: boolean;

  // Drawer states
  createDrawerOpen: boolean;
  viewDrawerOpen: boolean;
  editDrawerOpen: boolean;

  // AlertDialog state
  acceptDialogOpen: boolean;
  rejectDialogOpen: boolean;
  deliverDialogOpen: boolean;

  // Selected donation
  selectedDonation: Donation | null;

  // Drawer actions
  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  openViewDrawer: (donation: Donation) => void;
  closeViewDrawer: () => void;
  openEditDrawer: (donation: Donation) => void;
  closeEditDrawer: () => void;

  // AlertDialog actions
  openAcceptDialog: (donation: Donation) => void;
  closeAcceptDialog: () => void;
  openRejectDialog: (donation: Donation) => void;
  closeRejectDialog: () => void;
  openDeliverDialog: (donation: Donation) => void;
  closeDeliverDialog: () => void;
}

const DonationsContext = createContext<DonationsContextType | undefined>(
  undefined
);

export function DonationsProvider({ children }: { children: React.ReactNode }) {
  // Hooks
  const { user, loading: loadingUser } = useUser();
  const { donations, loading: loadingDonations, refetch } = useDonations();

  // Role checks
  const isDonor = user?.role === "donor";
  const isInstitution = user?.role === "institution";
  const donor = isDonor ? (user as DonorData) : null;
  const institution = isInstitution ? (user as InstitutionData) : null;

  // Drawer states
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );

  // Drawer actions
  const openCreateDrawer = useCallback(() => {
    setCreateDrawerOpen(true);
  }, []);

  const closeCreateDrawer = useCallback(() => {
    setCreateDrawerOpen(false);
  }, []);

  const openViewDrawer = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setViewDrawerOpen(true);
  }, []);

  const closeViewDrawer = useCallback(() => {
    setViewDrawerOpen(false);
    setSelectedDonation(null);
  }, []);

  const openEditDrawer = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setEditDrawerOpen(true);
  }, []);

  const closeEditDrawer = useCallback(() => {
    setEditDrawerOpen(false);
    setSelectedDonation(null);
  }, []);

  // AlertDialog actions
  const openAcceptDialog = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setAcceptDialogOpen(true);
  }, []);

  const closeAcceptDialog = useCallback(() => {
    setAcceptDialogOpen(false);
    setSelectedDonation(null);
  }, []);

  const openRejectDialog = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setRejectDialogOpen(true);
  }, []);

  const closeRejectDialog = useCallback(() => {
    setRejectDialogOpen(false);
    setSelectedDonation(null);
  }, []);

  const openDeliverDialog = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setDeliverDialogOpen(true);
  }, []);

  const closeDeliverDialog = useCallback(() => {
    setDeliverDialogOpen(false);
    setSelectedDonation(null);
  }, []);

  return (
    <DonationsContext.Provider
      value={{
        donations,
        loading: loadingDonations || loadingUser,
        refetch,
        donor,
        institution,
        isDonor,
        isInstitution,
        createDrawerOpen,
        viewDrawerOpen,
        editDrawerOpen,
        acceptDialogOpen,
        rejectDialogOpen,
        deliverDialogOpen,
        selectedDonation,
        openCreateDrawer,
        closeCreateDrawer,
        openViewDrawer,
        closeViewDrawer,
        openEditDrawer,
        closeEditDrawer,
        openAcceptDialog,
        closeAcceptDialog,
        openRejectDialog,
        closeRejectDialog,
        openDeliverDialog,
        closeDeliverDialog,
      }}
    >
      {children}
    </DonationsContext.Provider>
  );
}

export function useDonationsContext() {
  const context = useContext(DonationsContext);
  if (context === undefined) {
    throw new Error(
      "useDonationsContext must be used within a DonationsProvider"
    );
  }
  return context;
}
