"use client";

import { useState } from "react";
import { useDonationsContext } from "@/contexts/donations-context";
import { rejectDonation } from "@/actions/donations/reject";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REASON_MIN_LENGTH = 10;

export function RejectDonationDialog() {
  const { rejectDialogOpen, closeRejectDialog, selectedDonation, refetch } =
    useDonationsContext();
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState(false);
  const reset = () => {
    setRejectionReason("");
    setError(false);
  }


  const handleRejectionReasonChange = (value: string) => {
    setRejectionReason(value);
    if (value.trim().length > 0 && value.trim().length < REASON_MIN_LENGTH) {
      setError(true);
    } else {
      setError(false);
    }
  };


  const handleConfirm = async () => {
    if (!selectedDonation) return;

    const trimmedReason = rejectionReason.trim();
    if (trimmedReason.length < REASON_MIN_LENGTH) {
      setError(true);
      return;
    }

    const result = await rejectDonation(selectedDonation.id, trimmedReason);

    if (result.success) {
      toast.success("Donación rechazada");
      reset();
      await refetch();
      closeRejectDialog();
    } else {
      toast.error(result.error || "Error al rechazar la donación");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    closeRejectDialog();
  };

  const isValid = rejectionReason.trim().length >= REASON_MIN_LENGTH;

  return (
    <AlertDialog open={rejectDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Rechazar donación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la donación como rechazada, por favor proveenos el motivo de rechazo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 leading-none">
          <span className="text-xs text-gray-500">
            Danos el detalle de por qué motivo la donación no puede ser aceptada.
            Ej: &quot;Las fotos muestran los bienes muy deteriorados&quot; o &quot;El lote de alimentos provisto se encuentra expirado&quot;
          </span>
          <Textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => handleRejectionReasonChange(e.target.value)}
            className="min-h-24"
          />
          <p className={cn("text-sm", error ? "text-red-500" : "text-muted-foreground")}>
            El motivo debe tener al menos {REASON_MIN_LENGTH} caracteres
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!isValid}>
            Rechazar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}
