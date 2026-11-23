"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { DatePicker, isPastDay } from "@/components/common/date-picker";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceResult } from "@/lib/shared/result";
import { createCampaignSchema, type CreateCampaignInput } from "@/lib/validations";

interface CampaignFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  defaultValues: CreateCampaignInput;
  onSubmit: (data: CreateCampaignInput) => Promise<ServiceResult<unknown>>;
}

export function CampaignFormDrawer({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  pendingLabel,
  successMessage,
  defaultValues,
  onSubmit,
}: CampaignFormDrawerProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues,
  });

  function close() {
    reset(defaultValues);
    onOpenChange(false);
  }

  async function submit(data: CreateCampaignInput) {
    const result = await onSubmit(data);
    if (!result.ok) return void toast.error(result.error);
    toast.success(successMessage);
    reset(data);
    onOpenChange(false);
  }

  return (
    <DrawerLayout
      open={open}
      onOpenChange={(next) => !next && close()}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="campaign-form" disabled={isSubmitting}>
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
        <Field className="col-span-2" data-invalid={!!errors.type}>
          <FieldLabel htmlFor="type">Nombre</FieldLabel>
          <Input
            id="type"
            aria-invalid={!!errors.type}
            {...register("type")}
            placeholder="Ej: Donación de alimentos, Ropa, Medicamentos…"
          />
          <FieldError errors={[errors.type]} />
        </Field>

        <Field className="col-span-2" data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <FieldDescription>
            Contá qué se necesita y con qué se puede colaborar. Sé tan específico como puedas
            (cantidades, tamaños, etc.).
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
          <FieldLabel htmlFor="termination_date">Fecha de finalización (opcional)</FieldLabel>
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
