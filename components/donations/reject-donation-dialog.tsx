"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { rejectDonation } from "@/actions/donations/reject";
import { rejectDonationSchema, type RejectDonationInput } from "@/lib/validations";

interface RejectDonationDialogProps {
  donationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Diálogo con contenido propio: form RHF dentro de un AlertDialog (04-frontend, ConfirmDialog).
export function RejectDonationDialog({ donationId, open, onOpenChange }: RejectDonationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectDonationInput>({
    resolver: zodResolver(rejectDonationSchema),
    defaultValues: { donationId, reason: "" },
  });

  function setOpen(next: boolean) {
    if (isSubmitting) return;
    if (!next) reset({ donationId, reason: "" });
    onOpenChange(next);
  }

  async function submit(values: RejectDonationInput) {
    const result = await rejectDonation(values);
    if (!result.ok) return void toast.error(result.error);
    toast.success("Donación rechazada");
    reset({ donationId, reason: "" });
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar la donación?</AlertDialogTitle>
            <AlertDialogDescription>
              La donación queda rechazada y el donante ve el motivo. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason}>
            <FieldLabel htmlFor="reason">Motivo</FieldLabel>
            <FieldDescription>
              Ej: &quot;Las fotos muestran los bienes muy deteriorados&quot; o &quot;Los alimentos están
              vencidos&quot;.
            </FieldDescription>
            <Textarea
              id="reason"
              className="min-h-24"
              aria-invalid={!!errors.reason}
              disabled={isSubmitting}
              {...register("reason")}
            />
            <FieldError errors={[errors.reason]} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Rechazando…" : "Rechazar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
