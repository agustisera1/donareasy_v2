"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createGuestDonation } from "@/actions/donations/create-guest";
import { uploadAttachments } from "@/lib/uploads/upload-attachments";
import { donationFormSchema, type DonationFormValues } from "@/lib/validations";
import { DonationFormFields } from "./donation-form-fields";
import {
  emptyDonationForm,
  toContentInput,
  toInstitutionId,
  type InstitutionOption,
} from "./donation-form-model";

interface GuestDonationFormProps {
  token: string;
  institutions: InstitutionOption[];
}

export function GuestDonationForm({ token, institutions }: GuestDonationFormProps) {
  const router = useRouter();
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: emptyDonationForm,
  });
  const { handleSubmit, formState: { isSubmitting } } = form;

  async function submit(values: DonationFormValues) {
    const upload = await uploadAttachments([values.attachment!], token);
    if (!upload.ok) return void toast.error(upload.error);

    const result = await createGuestDonation({
      ...toContentInput(values),
      token,
      institutionId: toInstitutionId(values),
      attachment: upload.data[0],
    });
    if (!result.ok) return void toast.error(result.error);

    router.replace(result.data.status === "expired" ? "/donate?expired=1" : "/donate/success");
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6">
      <fieldset disabled={isSubmitting}>
        <DonationFormFields form={form} mode="create" institutions={institutions} />
      </fieldset>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando donación…" : "Enviar donación"}
      </Button>
    </form>
  );
}
