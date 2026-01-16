"use client";

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
import { toast } from "sonner";

export function RejectDonationDialog() {
  const { rejectDialogOpen, closeRejectDialog, selectedDonation, refetch } =
    useDonationsContext();

  const handleConfirm = async () => {
    if (!selectedDonation) return;

    const result = await rejectDonation(selectedDonation.id);

    if (result.success) {
      toast.success("Donación rechazada");
      await refetch();
      closeRejectDialog();
    } else {
      toast.error(result.error || "Error al rechazar la donación");
    }
  };

  return (
    <AlertDialog open={rejectDialogOpen} onOpenChange={closeRejectDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Rechazar donación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la donación como rechazada. ¿Estás seguro de que
            deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Rechazar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
