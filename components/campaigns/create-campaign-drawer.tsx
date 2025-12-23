"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { campaignSchema, type CampaignFormSchema } from "@/lib/validations";
import { createCampaign } from "@/actions/campaign/create";
import { useState } from "react";
import { toast } from "sonner";
import { useCampaignsContext } from "@/contexts/campaigns-context";

type CampaignFormData = CampaignFormSchema;

export function CreateCampaignDrawer() {
  const { createDrawerOpen, closeCreateDrawer, institution, refetch } =
    useCampaignsContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    mode: "onChange",
    defaultValues: {
      type: "",
      description: "",
      quantity: "",
      termination_date: "",
    },
  });

  // Resetear el formulario cuando se cierra el drawer
  const handleClose = () => {
    reset();
    closeCreateDrawer();
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!institution || !institution.id) {
      toast.error("Error", {
        description: "No se pudo obtener la información de la institución.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCampaign(data, institution.id);

      if (!result.success) {
        toast.error("Error al crear la campaña", {
          description: result.error || "Ocurrió un error inesperado",
        });
        return;
      }

      toast.success("Campaña creada!", {
        description: "La campaña se ha creado correctamente.",
      });

      reset();
      closeCreateDrawer();
      refetch(); // Refrescar la lista después de crear exitosamente
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

  return (
    <Drawer
      direction="right"
      open={createDrawerOpen}
      onOpenChange={handleClose}
    >
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Crear nueva campaña</DrawerTitle>
          <DrawerDescription>
            Completa los datos para crear una nueva campaña
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-4"
        >
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
            {isLoading ? "Creando..." : "Crear Campaña"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
