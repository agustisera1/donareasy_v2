"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eraser, ImagePlus, Info } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { guestDonationSchema, type GuestDonationFormSchema } from "@/lib/validations";
import { createGuestDonation } from "@/actions/donations/create-guest";
import { ImagePreview } from "@/components/donations/image-preview";
import {
  deliveryMethodTranslations,
  categoryTranslations,
} from "@/lib/constants";

interface Institution {
  id: string;
  name: string;
}

interface GuestDonationFormProps {
  token: string;
  institutions: Institution[];
}

export function GuestDonationForm({ token, institutions }: GuestDonationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GuestDonationFormSchema>({
    resolver: zodResolver(guestDonationSchema),
    mode: "onChange",
    defaultValues: {
      institution_id: "",
      open_donation: false,
      donation_type: "goods",
      delivery_method: "pickup",
      category: "supplies",
      amount: "",
      attachment_name: null,
      name: "",
      description: "",
    },
  });

  const donationType = watch("donation_type");
  const attachment = watch("attachment_name");
  const openDonation = watch("open_donation");

  useEffect(() => {
    let objectUrl: string | null = null;
    if (attachment && attachment.length > 0) {
      const file = attachment[0];
      if (file.type.startsWith("image/")) {
        objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment]);

  useEffect(() => {
    if (openDonation) setValue("institution_id", "", { shouldValidate: false });
  }, [openDonation, setValue]);

  useEffect(() => {
    if (donationType === "money") {
      setValue("delivery_method", "transfer");
      setValue("category", "other");
    } else {
      setValue("delivery_method", "pickup");
    }
  }, [donationType, setValue]);

  const clearImage = () => {
    setValue("attachment_name", null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: GuestDonationFormSchema) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await createGuestDonation(token, data);
      if (!result.success) {
        if (result.error === "expired") {
          router.replace("/donate?expired=1");
          return;
        }
        setServerError(result.error ?? "Ocurrió un error inesperado");
        return;
      }
      router.push("/donate/success");
    } catch {
      setServerError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {/* Institución */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="institution_id">Institución</Label>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="open_donation"
              className="text-sm text-muted-foreground font-normal"
            >
              No tengo preferencia
            </Label>
            <Switch
              id="open_donation"
              checked={openDonation}
              onCheckedChange={(checked) =>
                setValue("open_donation", checked, { shouldValidate: true })
              }
              disabled={isLoading}
            />
          </div>
        </div>
        <Select
          value={watch("institution_id")}
          onValueChange={(value) =>
            setValue("institution_id", value, { shouldValidate: true })
          }
          disabled={isLoading || openDonation}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                openDonation
                  ? "Sin preferencia de institución"
                  : "Selecciona una institución"
              }
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
        {errors.institution_id && (
          <p className="text-sm text-red-500">
            {errors.institution_id.message}
          </p>
        )}
      </div>

      {/* Tipo de donación */}
      <div className="grid gap-2">
        <Label htmlFor="donation_type">Tipo de donación</Label>
        <Select
          value={watch("donation_type")}
          onValueChange={(value: "money" | "goods") =>
            setValue("donation_type", value, { shouldValidate: true })
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="money">Monetaria</SelectItem>
            <SelectItem value="goods">Bienes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forma de entrega (solo bienes) */}
      {donationType !== "money" && (
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="delivery_method">Forma de entrega</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full focus:outline-none"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-3">
                  {(["pickup", "shipment", "agreement"] as const).map((m) => (
                    <div key={m}>
                      <p className="font-semibold text-sm">
                        {deliveryMethodTranslations[m].label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deliveryMethodTranslations[m].description}
                      </p>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={watch("delivery_method")}
            onValueChange={(
              value: "pickup" | "shipment" | "agreement" | "transfer"
            ) => setValue("delivery_method", value, { shouldValidate: true })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la forma de entrega" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">
                {deliveryMethodTranslations.pickup.label}
              </SelectItem>
              <SelectItem value="shipment">
                {deliveryMethodTranslations.shipment.label}
              </SelectItem>
              <SelectItem value="agreement">
                {deliveryMethodTranslations.agreement.label}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.delivery_method && (
            <p className="text-sm text-red-500">
              {errors.delivery_method.message}
            </p>
          )}
        </div>
      )}

      {/* Categoría (solo bienes) */}
      {donationType !== "money" && (
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full focus:outline-none"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-3">
                  {(["supplies", "clothing", "food", "other"] as const).map(
                    (c) => (
                      <div key={c}>
                        <p className="font-semibold text-sm">
                          {categoryTranslations[c].label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {categoryTranslations[c].description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={watch("category")}
            onValueChange={(
              value: "supplies" | "clothing" | "food" | "other"
            ) => setValue("category", value, { shouldValidate: true })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la categoría" />
            </SelectTrigger>
            <SelectContent>
              {(["supplies", "clothing", "food", "other"] as const).map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {categoryTranslations[c].label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      )}

      {/* Campos condicionales por tipo */}
      {donationType === "money" ? (
        <Fragment>
          <div className="grid gap-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label className="flex-1">Comprobante de transferencia</Label>
              {attachment && attachment.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearImage}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              id="attachment_name"
              type="file"
              lang="es"
              className="hidden"
              accept=".png,.jpg,.jpeg,.pdf"
              {...register("attachment_name")}
              disabled={isLoading}
              ref={(e) => {
                register("attachment_name").ref(e);
                fileInputRef.current = e;
              }}
            />
            {errors.attachment_name && (
              <p className="text-sm text-red-500">
                {errors.attachment_name.message as string}
              </p>
            )}
            {imagePreview && (
              <div className="mt-2">
                <ImagePreview src={imagePreview} alt="Preview del comprobante" />
              </div>
            )}
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ej: Ropa de invierno"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <span className="text-xs text-gray-500">
              Danos detalle de la donación, qué se ofrece, cómo se pretende
              colaborar, qué recaudos hay que tener en cuenta. Sé tan específico
              como puedas.
            </span>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label className="flex-1">Imagen adjunta</Label>
              {attachment && attachment.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearImage}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              type="file"
              lang="es"
              className="hidden"
              accept=".png,.jpg,.jpeg,.pdf"
              {...register("attachment_name")}
              disabled={isLoading}
              ref={(e) => {
                register("attachment_name").ref(e);
                fileInputRef.current = e;
              }}
            />
            {errors.attachment_name && (
              <p className="text-sm text-red-500">
                {errors.attachment_name.message as string}
              </p>
            )}
            {imagePreview && (
              <div className="mt-2">
                <ImagePreview src={imagePreview} alt="Preview de la imagen" />
              </div>
            )}
          </div>
        </Fragment>
      )}

      {serverError && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Enviando donación..." : "Enviar donación"}
      </Button>
    </form>
  );
}
