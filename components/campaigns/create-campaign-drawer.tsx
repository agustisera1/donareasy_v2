"use client";

import { createCampaign } from "@/actions/campaign/create";
import { CampaignFormDrawer } from "./campaign-form-drawer";

interface CreateCampaignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDrawer({ open, onOpenChange }: CreateCampaignDrawerProps) {
  return (
    <CampaignFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva campaña"
      description="Completá los datos para crear una campaña"
      submitLabel="Crear campaña"
      pendingLabel="Creando…"
      successMessage="Campaña creada"
      defaultValues={{ type: "", description: "", quantity: "", termination_date: "" }}
      onSubmit={createCampaign}
    />
  );
}
