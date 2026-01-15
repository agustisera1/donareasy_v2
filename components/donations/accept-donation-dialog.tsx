"use client";

import { useDonationsContext } from "@/contexts/donations-context";
import { acceptDonation } from "@/actions/donations/accept";
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

export function AcceptDonationDialog() {
  const {
    acceptDialogOpen,
    closeAcceptDialog,
    selectedDonation,
    refetch,
  } = useDonationsContext();

  const handleConfirm = async () => {
    if (!selectedDonation) return;

    const result = await acceptDonation(selectedDonation.id);

    if (result.success) {
      toast.success("Donación aceptada exitosamente");
      await refetch();
      closeAcceptDialog();
    } else {
      toast.error(result.error || "Error al aceptar la donación");
    }
  };

  return (
    <AlertDialog open={acceptDialogOpen} onOpenChange={closeAcceptDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Aceptar donación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la donación como aceptada. ¿Estás seguro de
            que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

