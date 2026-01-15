"use client";

import { useDonationsContext } from "@/contexts/donations-context";
import { deliverDonation } from "@/actions/donations/deliver";
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

export function DeliverDonationDialog() {
  const {
    deliverDialogOpen,
    closeDeliverDialog,
    selectedDonation,
    refetch,
  } = useDonationsContext();

  const handleConfirm = async () => {
    if (!selectedDonation) return;

    const result = await deliverDonation(selectedDonation.id);

    if (result.success) {
      toast.success("Donación marcada como entregada exitosamente");
      await refetch();
      closeDeliverDialog();
    } else {
      toast.error(result.error || "Error al marcar la donación como entregada");
    }
  };

  return (
    <AlertDialog open={deliverDialogOpen} onOpenChange={closeDeliverDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Marcar donación como entregada?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la donación como entregada. ¿Estás seguro de
            que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Marcar como entregada
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

