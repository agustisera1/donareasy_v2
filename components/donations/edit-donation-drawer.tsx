"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { updateDonation } from "@/actions/donations/update";
import type { Donation } from "@/lib/types";
import { uploadAttachments } from "@/lib/uploads/upload-attachments";
import { editDonationFormSchema, type DonationFormValues } from "@/lib/validations";
import { DonationFormFields } from "./donation-form-fields";
import { formValuesFromDonation, toContentInput } from "./donation-form-model";

interface EditDonationDrawerProps {
  donation: Donation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Se monta con `key={donation.id}`: cambiar de donación resetea el form sin un efecto.
export function EditDonationDrawer({ donation, open, onOpenChange }: EditDonationDrawerProps) {
  const defaultValues = formValuesFromDonation(donation);
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(editDonationFormSchema),
    defaultValues,
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = form;

  function close() {
    reset(defaultValues);
    onOpenChange(false);
  }

  async function submit(values: DonationFormValues) {
    let attachment;
    if (values.attachment) {
      const upload = await uploadAttachments([values.attachment]);
      if (!upload.ok) return void toast.error(upload.error);
      attachment = upload.data[0];
    }

    const result = await updateDonation({
      ...toContentInput(values),
      donationId: donation.id,
      attachment,
    });
    if (!result.ok) return void toast.error(result.error);

    toast.success("Donación actualizada");
    reset({ ...values, attachment: null });
    onOpenChange(false);
  }

  return (
    <DrawerLayout
      open={open}
      onOpenChange={(next) => !next && close()}
      title="Editar donación"
      description="Podés editarla mientras siga pendiente"
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-donation-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="edit-donation-form" onSubmit={handleSubmit(submit)}>
        <fieldset disabled={isSubmitting}>
          <DonationFormFields form={form} mode="edit" currentImageUrl={donation.attachment_url} />
        </fieldset>
      </form>
    </DrawerLayout>
  );
}
