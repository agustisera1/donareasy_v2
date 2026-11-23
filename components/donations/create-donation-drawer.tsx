"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { createDonation } from "@/actions/donations/create";
import { uploadAttachments } from "@/lib/uploads/upload-attachments";
import { donationFormSchema, type DonationFormValues } from "@/lib/validations";
import { DonationFormFields } from "./donation-form-fields";
import {
  emptyDonationForm,
  toContentInput,
  toInstitutionId,
  type InstitutionOption,
} from "./donation-form-model";

export type DonationCampaign = { campaignId: string; institutionId: string };

interface CreateDonationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutions: InstitutionOption[];
  campaign: DonationCampaign | null;
}

export function CreateDonationDrawer({
  open,
  onOpenChange,
  institutions,
  campaign,
}: CreateDonationDrawerProps) {
  const defaultValues = { ...emptyDonationForm, institutionId: campaign?.institutionId ?? "" };
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues,
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = form;

  function close() {
    reset(defaultValues);
    onOpenChange(false);
  }

  async function submit(values: DonationFormValues) {
    const upload = await uploadAttachments([values.attachment!]);
    if (!upload.ok) return void toast.error(upload.error);

    const result = await createDonation({
      ...toContentInput(values),
      institutionId: toInstitutionId(values),
      campaignId: campaign?.campaignId,
      attachment: upload.data[0],
    });
    if (!result.ok) return void toast.error(result.error);

    toast.success("Donación creada");
    close();
  }

  return (
    <DrawerLayout
      open={open}
      onOpenChange={(next) => !next && close()}
      title="Nueva donación"
      description={campaign ? "Tu donación va a la campaña elegida" : "Completá los datos de tu donación"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="create-donation-form" disabled={isSubmitting}>
            {isSubmitting ? "Creando…" : "Crear donación"}
          </Button>
        </>
      }
    >
      <form id="create-donation-form" onSubmit={handleSubmit(submit)}>
        <fieldset disabled={isSubmitting}>
          <DonationFormFields
            form={form}
            mode="create"
            institutions={institutions}
            lockInstitution={!!campaign}
          />
        </fieldset>
      </form>
    </DrawerLayout>
  );
}
