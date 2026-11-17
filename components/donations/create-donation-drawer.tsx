"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { Eraser, ImagePlus, Info } from "lucide-react";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { donationSchema, type DonationFormSchema } from "@/lib/validations";
import { createDonation } from "@/actions/donations/create";
import { uploadFile } from "@/actions/storage/upload";
import { toast } from "sonner";
import { useDonationsContext } from "@/contexts/donations-context";
import { createClient } from "@/lib/supabase/client";
import { Institution } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { useSearchParams } from "next/navigation";
import { Fragment } from "react";
import { ImagePreview } from "./image-preview";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deliveryMethodTranslations,
  categoryTranslations,
} from "@/lib/constants";

type DonationFormData = DonationFormSchema;

export function CreateDonationDrawer() {
  const {
    createDrawerOpen,
    openCreateDrawer,
    closeCreateDrawer,
    donor,
    refetch,
  } = useDonationsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaign_id");
  const institutionId = searchParams.get("institution_id");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
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

  const donationType = watch("donation_type") as "money" | "goods";
  const attachment = watch("attachment_name");
  const openDonation = watch("open_donation");

  // Cargar instituciones al abrir el drawer
  useEffect(() => {
    if (createDrawerOpen) {
      loadInstitutions();
    }
  }, [createDrawerOpen]);

  // Manejar preview cuando se selecciona un nuevo archivo
  useEffect(() => {
    let objectUrl: string | null = null;

    // Si hay un archivo nuevo seleccionado, mostrar su preview
    if (attachment && attachment.length > 0) {
      const file = attachment[0];
      if (file.type.startsWith("image/")) {
        // Crear preview del archivo nuevo
        objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
      } else {
        // Para PDFs, no mostrar preview
        setImagePreview(null);
      }
    } else {
      // Si no hay archivo seleccionado, no mostrar preview
      setImagePreview(null);
    }

    // Limpiar el objeto URL cuando el componente se desmonte o cambie el archivo
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment]);

  useEffect(() => {
    if (openDonation) {
      setValue("institution_id", "", { shouldValidate: false });
    }
  }, [openDonation, setValue]);

  useEffect(() => {
    if (donationType === "money") {
      setValue("delivery_method", "transfer");
      setValue("category", "other");
    } else {
      setValue("delivery_method", "pickup");
    }
  }, [donationType, setValue]);

  useEffect(() => {
    if (campaignId && institutionId) {
      openCreateDrawer();
      const institution = institutions?.find(
        (institution) => institution.id === institutionId
      );
      if (institution) setValue("institution_id", institution.id);
    }
  }, [
    loadingInstitutions,
    campaignId,
    institutionId,
    setValue,
    institutions,
    openCreateDrawer,
  ]);

  const loadInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("name");

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error("Error loading institutions:", error);
      toast.error("Error al cargar instituciones");
    } finally {
      setLoadingInstitutions(false);
    }
  };

  // Resetear el formulario cuando se cierra el drawer
  const handleClose = () => {
    reset();
    setImagePreview(null);
    closeCreateDrawer();
  };

  // Resetear el input de imagen
  const clearImage = () => {
    setValue("attachment_name", null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    if (!donor || !donor.id) {
      toast.error("Error", {
        description: "No se pudo obtener la información del donante.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Procesar archivo (obligatorio para ambos tipos de donación)
      let attachmentUrl = "";
      let attachmentFileName = "";

      // El archivo ya está validado por Zod
      if (data.attachment_name && data.attachment_name.length > 0) {
        const file = data.attachment_name[0];

        // Determinar el nombre del archivo según el tipo de donación
        let fileName: string | undefined;
        if (data.donation_type === "goods" && data.name) {
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

        attachmentUrl = uploadResult.url || "";
        attachmentFileName = uploadResult.fileName || file.name;
      }

      const donationData: {
        institution_id: string | null;
        donor_id: string;
        attachment_url: string;
        status: "pending";
        delivery_method: "pickup" | "shipment" | "agreement" | "transfer";
        category: "supplies" | "clothing" | "food" | "other";
        name?: string | null;
        description?: string | null;
        amount?: number | null;
        attachment_name?: string | null;
      } = {
        institution_id: data.open_donation ? null : (data.institution_id || null),
        donor_id: donor.id,
        attachment_url: attachmentUrl,
        status: "pending",
        delivery_method: data.delivery_method,
        category: data.category,
      };

      if (data.donation_type === "money") {
        if (data.amount) {
          const amountNum = parseFloat(data.amount);
          if (!isNaN(amountNum)) {
            donationData.amount = amountNum;
          }
        }
        donationData.attachment_name = attachmentFileName || null;
        donationData.name = null;
        donationData.description = null;
      } else {
        donationData.name = data.name || null;
        donationData.description = data.description || null;
        donationData.attachment_name = attachmentFileName || null;
        donationData.amount = null;
      }

      const result = await createDonation(donationData);

      if (!result.success) {
        toast.error("Error al crear la donación", {
          description: result.error || "Ocurrió un error inesperado",
        });
        return;
      }

      toast.success("Donación creada!", {
        description: "La donación se ha creado correctamente.",
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
    <DrawerLayout
      open={createDrawerOpen}
      onOpenChange={handleClose}
      title="Crear nueva donación"
      description="Completa los datos para crear una nueva donación"
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
            {isLoading ? "Creando…" : "Crear donación"}
          </Button>
        </>
      }
    >
      <form className="grid grid-cols-2 gap-4">
        <Field className="col-span-2" data-invalid={!!errors.institution_id}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="institution_id">Institución</FieldLabel>
            <div className="flex items-center gap-2">
              <FieldLabel htmlFor="open_donation" className="text-sm text-muted-foreground font-normal">
                No tengo preferencia
              </FieldLabel>
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
            onValueChange={(value) => {
              setValue("institution_id", value, { shouldValidate: true });
            }}
            disabled={loadingInstitutions || isLoading || openDonation}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={openDonation ? "Sin preferencia de institución" : "Selecciona una institución"}
                defaultValue={institutionId || undefined}
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
          <FieldError errors={[errors.institution_id]} />
        </Field>

        <Field className="col-span-2">
          <FieldLabel htmlFor="donation_type">Tipo de donación</FieldLabel>
          <Select
            value={watch("donation_type")}
            onValueChange={(value: "money" | "goods") => {
              setValue("donation_type", value, { shouldValidate: true });
            }}
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
        </Field>

        {donationType !== "money" && <Field className="col-span-2" data-invalid={!!errors.delivery_method}>
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
            onValueChange={(value: "pickup" | "shipment" | "agreement" | "transfer") => {
              setValue("delivery_method", value, { shouldValidate: true });
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

        {donationType !== "money" && <Field className="col-span-2" data-invalid={!!errors.category}>
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

        {donationType === "money" ? (
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
                {attachment && attachment.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearImage}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Eraser />
                    <span className="sr-only">Quitar archivo</span>
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
                disabled={isLoading}
              />
              <FieldError errors={[errors.name]} />
            </Field>

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
                {attachment && attachment.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearImage}
                    disabled={isLoading}
                    size="icon-sm"
                  >
                    <Eraser />
                    <span className="sr-only">Quitar archivo</span>
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
