"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  campaignEditSchema,
  type CampaignEditFormSchema,
} from "@/lib/validations";
import { updateCampaign } from "@/actions/campaign/update";
import { useState } from "react";
import { toast } from "sonner";
import { useCampaignsContext } from "@/contexts/campaigns-context";

type CampaignEditFormData = CampaignEditFormSchema;

export function EditCampaignDrawer() {
  const { editDrawerOpen, closeEditDrawer, selectedCampaign, refetch } =
    useCampaignsContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampaignEditFormData>({
    resolver: zodResolver(campaignEditSchema),
    mode: "onChange", // Validar en tiempo real
    defaultValues: {
      type: "",
      description: "",
      quantity: "",
      termination_date: "",
    },
  });

  // Actualizar valores del formulario cuando se abre el drawer o cuando cambian los datos de la campaña
  useEffect(() => {
    if (!editDrawerOpen || !selectedCampaign) return;

    reset({
      type: selectedCampaign.type,
      description: selectedCampaign.description,
      quantity: selectedCampaign.quantity || "",
      termination_date: selectedCampaign.termination_date || "",
    });
  }, [editDrawerOpen, selectedCampaign, reset]);

  // Resetear el formulario cuando se cierra el drawer
  const handleClose = () => {
    reset();
    closeEditDrawer();
  };

  const onSubmit = async (data: CampaignEditFormData) => {
    if (!selectedCampaign || !selectedCampaign.id) {
      toast.error("Error", {
        description: "No se pudo obtener la información de la campaña.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCampaign(data, selectedCampaign.id);

      if (!result.success) {
        toast.error("Error al actualizar la campaña", {
          description: result.error || "Ocurrió un error inesperado",
        });
        return;
      }

      toast.success("Campaña actualizada!", {
        description: "La campaña se ha actualizado correctamente.",
      });

      reset();
      closeEditDrawer();
      refetch(); // Refrescar datos después de actualizar exitosamente
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";
      toast.error("Error inesperado", {
        description: errorMessage,
      });
      console.error("Error submitting form:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedCampaign) {
    return null;
  }

  return (
    <Drawer direction="right" open={editDrawerOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Editar campaña</DrawerTitle>
          <DrawerDescription>Editar los datos de la campaña</DrawerDescription>
        </DrawerHeader>

        <form className="grid grid-cols-2 gap-4 p-4">
          <div className="grid gap-2 col-span-2">
            <Label htmlFor="type">Tipo de campaña</Label>
            <Input
              id="type"
              {...register("type")}
              placeholder="Ej: Donación de alimentos, Ropa, Medicamentos..."
            />
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="grid gap-2 col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe la campaña, qué se necesita, cómo pueden ayudar..."
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad (opcional)</Label>
            <Input
              id="quantity"
              {...register("quantity")}
              placeholder="Ej: 100 unidades, 50 kg..."
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="termination_date">
              Fecha de finalización (opcional)
            </Label>
            <Input
              id="termination_date"
              lang="es-AR"
              type="date"
              {...register("termination_date")}
            />
            {errors.termination_date && (
              <p className="text-sm text-red-500">
                {errors.termination_date.message}
              </p>
            )}
          </div>
        </form>

        <DrawerFooter className="border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Actualizando..." : "Guardar Cambios"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
