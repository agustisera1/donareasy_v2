"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Building2, ImageIcon, Package, Truck } from "lucide-react";

import { DetailCard } from "@/components/common/detail-card";
import { ImageInput } from "@/components/common/image-input";
import { InfoTooltip, InfoTooltipList } from "@/components/common/info-tooltip";
import { MoneyInput } from "@/components/common/money-input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categoryTranslations, deliveryMethodTranslations } from "@/lib/constants";
import type { DonationCategory, DeliveryMethod } from "@/lib/types";
import { ATTACHMENT_MIME_TYPES, type DonationFormValues } from "@/lib/validations";
import type { InstitutionOption } from "./donation-form-model";

const GOODS_DELIVERY_METHODS: DeliveryMethod[] = ["pickup", "shipment", "agreement"];
const CATEGORIES: DonationCategory[] = ["supplies", "clothing", "food", "other"];

interface DonationFormFieldsProps {
  form: UseFormReturn<DonationFormValues>;
  /** `edit` oculta institución y tipo: no cambian después de crear la donación. */
  mode: "create" | "edit";
  institutions?: InstitutionOption[];
  /** Donar desde una campaña fija la institución. */
  lockInstitution?: boolean;
  currentImageUrl?: string | null;
}

export function DonationFormFields({
  form,
  mode,
  institutions = [],
  lockInstitution = false,
  currentImageUrl = null,
}: DonationFormFieldsProps) {
  const { control, register, setValue, formState: { errors } } = form;
  const [donationType, openDonation] = useWatch({
    control,
    name: ["donationType", "openDonation"],
  });
  const isMoney = donationType === "money";

  return (
    <div className="space-y-3">
      {mode === "create" && (
        <DetailCard title="Destino" icon={<Building2 />}>
          <div className="grid gap-3">
            <Field data-invalid={!!errors.institutionId}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="institutionId">Institución</FieldLabel>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="openDonation" className="text-sm font-normal text-muted-foreground">
                    No tengo preferencia
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="openDonation"
                    render={({ field }) => (
                      <Switch
                        id="openDonation"
                        checked={field.value}
                        disabled={lockInstitution}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) setValue("institutionId", "", { shouldValidate: true });
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <Controller
                control={control}
                name="institutionId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={openDonation || lockInstitution}
                  >
                    <SelectTrigger id="institutionId" className="w-full" aria-invalid={!!errors.institutionId}>
                      <SelectValue
                        placeholder={openDonation ? "Sin preferencia de institución" : "Elegí una institución"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.institutionId]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="donationType">Tipo de donación</FieldLabel>
              <Controller
                control={control}
                name="donationType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: DonationFormValues["donationType"]) => {
                      field.onChange(value);
                      // Un monetario siempre es transferencia; al volver a bienes se parte de retiro.
                      setValue("deliveryMethod", value === "money" ? "transfer" : "pickup");
                      if (value === "money") setValue("category", "other");
                    }}
                  >
                    <SelectTrigger id="donationType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money">Monetaria</SelectItem>
                      <SelectItem value="goods">Bienes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
        </DetailCard>
      )}

      {isMoney ? (
        <DetailCard title="Detalle" icon={<Package />}>
          <Field data-invalid={!!errors.amount}>
            <FieldLabel htmlFor="amount">Monto</FieldLabel>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <MoneyInput
                  id="amount"
                  placeholder="$ 0"
                  aria-invalid={!!errors.amount}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError errors={[errors.amount]} />
          </Field>
        </DetailCard>
      ) : (
        <>
          <DetailCard title="Detalle" icon={<Package />}>
            <div className="grid gap-3">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  placeholder="Ej: Ropa de invierno"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.category}>
                <div className="flex items-center gap-0.5">
                  <FieldLabel htmlFor="category">Categoría</FieldLabel>
                  <InfoTooltip label="Qué incluye cada categoría">
                    <InfoTooltipList items={CATEGORIES.map((value) => categoryTranslations[value])} />
                  </InfoTooltip>
                </div>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {categoryTranslations[value].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.category]} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <FieldDescription>
                  Contá qué ofrecés y qué recaudos hay que tener en cuenta (frágil, conservación, etc.).
                </FieldDescription>
                <Textarea id="description" aria-invalid={!!errors.description} {...register("description")} />
                <FieldError errors={[errors.description]} />
              </Field>
            </div>
          </DetailCard>

          <DetailCard title="Entrega" icon={<Truck />}>
            <Field data-invalid={!!errors.deliveryMethod}>
              <div className="flex items-center gap-0.5">
                <FieldLabel htmlFor="deliveryMethod">Forma de entrega</FieldLabel>
                <InfoTooltip label="Qué significa cada forma de entrega">
                  <InfoTooltipList
                    items={GOODS_DELIVERY_METHODS.map((value) => deliveryMethodTranslations[value])}
                  />
                </InfoTooltip>
              </div>
              <Controller
                control={control}
                name="deliveryMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="deliveryMethod" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOODS_DELIVERY_METHODS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {deliveryMethodTranslations[value].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.deliveryMethod]} />
            </Field>
          </DetailCard>
        </>
      )}

      <Controller
        control={control}
        name="attachment"
        render={({ field }) => (
          <AttachmentField
            label={isMoney ? "Comprobante de transferencia" : "Imagen de la donación"}
            file={field.value}
            onChange={field.onChange}
            currentImageUrl={currentImageUrl}
            error={errors.attachment}
          />
        )}
      />
    </div>
  );
}

interface AttachmentFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  currentImageUrl: string | null;
  error?: { message?: string };
}

function AttachmentField({ label, file, onChange, currentImageUrl, error }: AttachmentFieldProps) {
  return (
    <ImageInput
      id="attachment"
      label={label}
      accept={ATTACHMENT_MIME_TYPES.join(",")}
      hint="PNG, JPG o WebP de hasta 5 MB"
      file={file}
      currentUrl={currentImageUrl}
      onChange={onChange}
      invalid={!!error}
      layout={({ body, actions }) => (
        <DetailCard title={label} icon={<ImageIcon />} action={actions}>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="attachment" className="sr-only">
              {label}
            </FieldLabel>
            {body}
            <FieldError errors={[error]} />
          </Field>
        </DetailCard>
      )}
    />
  );
}
