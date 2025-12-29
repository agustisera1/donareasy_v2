"use client";

import { useCampaignsContext } from "@/contexts/campaigns-context";
import { finishCampaign } from "@/actions/campaign/finish";
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

export function FinishCampaignDialog() {
  const {
    finishDialogOpen,
    closeFinishDialog,
    selectedCampaign,
    refetch,
  } = useCampaignsContext();

  const handleConfirm = async () => {
    if (!selectedCampaign) return;

    const result = await finishCampaign(selectedCampaign.id);

    if (result.success) {
      toast.success("Campaña finalizada exitosamente");
      await refetch();
      closeFinishDialog();
    } else {
      toast.error(result.error || "Error al finalizar la campaña");
    }
  };

  return (
    <AlertDialog open={finishDialogOpen} onOpenChange={closeFinishDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Finalizar campaña?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará la campaña como finalizada. ¿Estás seguro de
            que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Finalizar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

