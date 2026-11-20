"use client";

import { updateCampaign } from "@/actions/campaign/update";
import type { Campaign } from "@/lib/types";
import { CampaignFormDrawer } from "./campaign-form-drawer";

interface EditCampaignDrawerProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDrawer({ campaign, open, onOpenChange }: EditCampaignDrawerProps) {
  return (
    <CampaignFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Editar campaña"
      description="Modificá los datos de la campaña"
      submitLabel="Guardar cambios"
      pendingLabel="Guardando…"
      successMessage="Campaña actualizada"
      defaultValues={{
        type: campaign.type,
        description: campaign.description,
        quantity: campaign.quantity ?? "",
        termination_date: campaign.termination_date ?? "",
      }}
      onSubmit={(data) => updateCampaign({ campaignId: campaign.id, ...data })}
    />
  );
}
