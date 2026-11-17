"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, Fragment } from "react";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import {
  deliveryMethodTranslations,
  categoryTranslations,
} from "@/lib/constants";
import { Info } from "lucide-react";
import {
  donationEditSchema,
  type DonationEditFormSchema,
} from "@/lib/validations";
import { updateDonation } from "@/actions/donations/update";
import { uploadFile } from "@/actions/storage/upload";
import { useState } from "react";
import { toast } from "sonner";
import { useDonationsContext } from "@/contexts/donations-context";
import { ImagePreview } from "./image-preview";
import { Eraser, ImagePlus, Pencil } from "lucide-react";

type DonationEditFormData = DonationEditFormSchema;

export function EditDonationDrawer() {
  const { editDrawerOpen, closeEditDrawer, selectedDonation, refetch } =
    useDonationsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DonationEditFormData>({
    resolver: zodResolver(donationEditSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      amount: "",
      attachment_name: null,
      delivery_method: "pickup",
      category: "supplies",
    },
  });

  const transferReceipt = watch("attachment_name");

  // Actualizar valores del formulario cuando se abre el drawer o cuando cambian los datos de la donación
  useEffect(() => {
    if (!editDrawerOpen || !selectedDonation) return;

    reset({
      name: selectedDonation.name || "",
      description: selectedDonation.description || "",
      amount: selectedDonation.amount?.toString() || "",
      attachment_name: null,
      delivery_method: selectedDonation.delivery_method || "pickup",
      category: selectedDonation.category || "supplies",
    });

    // Guardar la URL de la imagen actual de la DB
    const dbImageUrl = selectedDonation.attachment_url || null;
    setCurrentImageUrl(dbImageUrl);

    // Mostrar la imagen actual de la DB al abrir el drawer
    setImagePreview(dbImageUrl);
  }, [editDrawerOpen, selectedDonation, reset]);

  // Manejar preview cuando se selecciona un nuevo archivo
  useEffect(() => {
    let objectUrl: string | null = null;

    // Si hay un archivo nuevo seleccionado, mostrar su preview
    if (transferReceipt && transferReceipt.length > 0) {
      const file = transferReceipt[0];
      if (file.type.startsWith("image/")) {
        // Crear preview del archivo nuevo
        objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
      } else {
        // Para PDFs, mantener la imagen actual de la DB
        setImagePreview(currentImageUrl);
      }
    } else {
      // Si no hay archivo seleccionado, mostrar la imagen actual de la DB
      setImagePreview(currentImageUrl);
    }

    // Limpiar el objeto URL cuando el componente se desmonte o cambie el archivo
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [transferReceipt, currentImageUrl]);

  // Resetear el formulario cuando se cierra el drawer
  const handleClose = () => {
    reset();
    setImagePreview(null);
    setCurrentImageUrl(null);
    closeEditDrawer();
  };

  // Resetear el input de imagen
  const handleClearImage = () => {
    setValue("attachment_name", null);
    setImagePreview(currentImageUrl); // Volver a mostrar la imagen de la DB
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: DonationEditFormData) => {
    if (!selectedDonation || !selectedDonation.id) {
      toast.error("Error", {
        description: "No se pudo obtener la información de la donación.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Procesar archivo si se proporciona uno nuevo
      let receiptUrl: string | undefined = undefined;
      let transferReceiptText: string | null = null;

      if (data.attachment_name && data.attachment_name.length > 0) {
        const file = data.attachment_name[0];

        // Determinar el nombre del archivo según el tipo de donación
        let fileName: string | undefined;
        if (!isMoney && data.name) {
          // Para donaciones de bienes, usar el nombre del formulario
          fileName = data.name;
        }
        // Para donaciones monetarias, no se provee fileName, se usará file.name por defecto

        // Subir el archivo a Supabase Storage
        const uploadResult = await uploadFile(file, fileName);

        if (!uploadResult.success) {
          toast.error("Error al subir el archivo", {
            description: uploadResult.error || "No se pudo subir el archivo",
          });
          setIsLoading(false);
          return;
        }

        receiptUrl = uploadResult.url;
        transferReceiptText = uploadResult.fileName || file.name;
      }

      const updateData: {
        name?: string | null;
        description?: string | null;
        amount?: number | null;
        attachment_name?: string | null;
        attachment_url?: string;
        delivery_method?: "pickup" | "shipment" | "agreement" | "transfer";
        category?: "supplies" | "clothing" | "food" | "other";
      } = {};

      // Si es donación monetaria, name y description deben ser null
      if (isMoney) {
        updateData.name = null;
        updateData.description = null;
      } else {
        // Si es donación de bienes, actualizar name y description
        if (data.name !== undefined) updateData.name = data.name || null;
        if (data.description !== undefined)
          updateData.description = data.description || null;
      }

      if (data.amount) {
        const amountNum = parseFloat(data.amount);
        if (!isNaN(amountNum)) {
          updateData.amount = amountNum;
        }
      } else {
        updateData.amount = null;
      }

      // Si se subió un nuevo archivo, actualizar ambos campos
      if (receiptUrl && transferReceiptText) {
        updateData.attachment_url = receiptUrl;
        updateData.attachment_name = transferReceiptText;
      }
      // Si no se subió archivo, no actualizar attachment_url ni attachment_name

      // Actualizar delivery_method y category
      if (data.delivery_method !== undefined)
        updateData.delivery_method = data.delivery_method;
      if (data.category !== undefined) updateData.category = data.category;

      const result = await updateDonation(selectedDonation.id, updateData);

      if (!result.success) {
        toast.error("Error al actualizar la donación", {
          description: result.error || "Ocurrió un error inesperado",
        });
        return;
      }

      toast.success("Donación actualizada!", {
        description: "La donación se ha actualizado correctamente.",
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

  if (!selectedDonation) {
    return null;
  }

  const isMoney = selectedDonation.amount !== null;

  return (
    <DrawerLayout
      open={editDrawerOpen}
      onOpenChange={handleClose}
      title="Editar donación"
      description="Editar los datos de la donación"
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
        {isMoney ? (
          <Fragment>
            <Field className="col-span-2" data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="amount">Monto</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                aria-invalid={!!errors.amount}
                {...register("amount")}
                placeholder="0.00"
                disabled={isLoading}
              />
              <FieldError errors={[errors.amount]} />
            </Field>
            <Field className="col-span-2" data-invalid={!!errors.attachment_name}>
              <div className="flex items-center gap-2">
                <FieldLabel className="flex-1">Comprobante de transferencia</FieldLabel>
                {transferReceipt && transferReceipt.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearImage}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Eraser />
                    <span className="sr-only">Quitar archivo</span>
                  </Button>
                ) : currentImageUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Pencil />
                    <span className="sr-only">Cambiar archivo</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <ImagePlus />
                    <span className="sr-only">Adjuntar archivo</span>
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
              <FieldError>{errors.attachment_name?.message as string | undefined}</FieldError>
              {imagePreview && (
                <div className="mt-2">
                  <ImagePreview
                    src={imagePreview}
                    alt="Preview del comprobante"
                  />
                </div>
              )}
            </Field>
          </Fragment>
        ) : (
          <Fragment>
            <Field className="col-span-2" data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Ej: Ropa de invierno"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {!isMoney && <Field className="col-span-2" data-invalid={!!errors.delivery_method}>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="delivery_method">Forma de entrega</FieldLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                    >
                      <Info className="text-muted-foreground" />
                      <span className="sr-only">Más información</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {deliveryMethodTranslations.pickup.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deliveryMethodTranslations.pickup.description}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {deliveryMethodTranslations.shipment.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deliveryMethodTranslations.shipment.description}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {deliveryMethodTranslations.agreement.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deliveryMethodTranslations.agreement.description}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={watch("delivery_method")}
                onValueChange={(
                  value: "pickup" | "shipment" | "agreement" | "transfer"
                ) => {
                  setValue("delivery_method", value, {
                    shouldValidate: true,
                  });
                }}
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
              <FieldError errors={[errors.delivery_method]} />
            </Field>}

            {!isMoney && <Field className="col-span-2" data-invalid={!!errors.category}>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="category">Categoría</FieldLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                    >
                      <Info className="text-muted-foreground" />
                      <span className="sr-only">Más información</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {categoryTranslations.supplies.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {categoryTranslations.supplies.description}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {categoryTranslations.clothing.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {categoryTranslations.clothing.description}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {categoryTranslations.food.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {categoryTranslations.food.description}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {categoryTranslations.other.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {categoryTranslations.other.description}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={watch("category")}
                onValueChange={(
                  value: "supplies" | "clothing" | "food" | "other"
                ) => {
                  setValue("category", value, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona la categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">
                    {categoryTranslations.supplies.label}
                  </SelectItem>
                  <SelectItem value="clothing">
                    {categoryTranslations.clothing.label}
                  </SelectItem>
                  <SelectItem value="food">
                    {categoryTranslations.food.label}
                  </SelectItem>
                  <SelectItem value="other">
                    {categoryTranslations.other.label}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.category]} />
            </Field>}

            <Field className="col-span-2" data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <FieldDescription>
                Danos detalle de la donación, qué se ofrece, cómo se pretende
                colaborar, qué recaudos hay que tener en cuenta (frágiles,
                conservación, etc.). Sé tan específico como puedas, para que
                los usuarios puedan entender mejor
              </FieldDescription>
              <Textarea
                id="description"
                aria-invalid={!!errors.description}
                {...register("description")}
                disabled={isLoading}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field className="col-span-2" data-invalid={!!errors.attachment_name}>
              <div className="flex items-center gap-2">
                <FieldLabel className="flex-1">Imagen adjunta</FieldLabel>
                {transferReceipt && transferReceipt.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearImage}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Eraser />
                    <span className="sr-only">Quitar archivo</span>
                  </Button>
                ) : currentImageUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Pencil />
                    <span className="sr-only">Cambiar archivo</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <ImagePlus />
                    <span className="sr-only">Adjuntar archivo</span>
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
              <FieldError>{errors.attachment_name?.message as string | undefined}</FieldError>
              {imagePreview && (
                <div className="mt-2">
                  <ImagePreview
                    src={imagePreview}
                    alt="Preview de la imagen"
                  />
                </div>
              )}
            </Field>
          </Fragment>
        )}
      </form>
    </DrawerLayout>
  );
}
