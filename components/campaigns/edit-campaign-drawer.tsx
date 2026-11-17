"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { DatePicker, isPastDay } from "@/components/common/date-picker";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    control,
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
    <DrawerLayout
      open={editDrawerOpen}
      onOpenChange={handleClose}
      title="Editar campaña"
      description="Editar los datos de la campaña"
      dismissible={false}
      footer={
        <>
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
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form className="grid grid-cols-2 gap-4">
        <Field className="col-span-2" data-invalid={!!errors.type}>
          <FieldLabel htmlFor="type">Nombre</FieldLabel>
          <Input
            id="type"
            aria-invalid={!!errors.type}
            {...register("type")}
            placeholder="Ej: Donación de alimentos, Ropa, Medicamentos..."
          />
          <FieldError errors={[errors.type]} />
        </Field>

        <Field className="col-span-2" data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <FieldDescription>
            Danos el detalle de la campaña, qué se necesita, con qué se
            pretende colaborar. Sé tan específico como puedas, para que los
            usuarios puedan entender mejor (cantidades, tamaños, etc.).
          </FieldDescription>
          <Textarea
            id="description"
            aria-invalid={!!errors.description}
            {...register("description")}
            rows={5}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field className="col-span-2" data-invalid={!!errors.termination_date}>
          <FieldLabel htmlFor="termination_date">
            Fecha de finalización (opcional)
          </FieldLabel>
          <Controller
            control={control}
            name="termination_date"
            render={({ field }) => (
              <DatePicker
                id="termination_date"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabledDays={isPastDay}
                aria-invalid={!!errors.termination_date}
              />
            )}
          />
          <FieldError errors={[errors.termination_date]} />
        </Field>
      </form>
    </DrawerLayout>
  );
}
