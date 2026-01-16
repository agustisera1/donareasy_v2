"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { Eraser, ImagePlus, Info } from "lucide-react";
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
        institution_id: string;
        donor_id: string;
        attachment_url: string;
        status: "pending";
        delivery_method: "pickup" | "shipment" | "agreement";
        category: "supplies" | "clothing" | "food" | "other";
        name?: string | null;
        description?: string | null;
        amount?: number | null;
        attachment_name?: string | null;
      } = {
        institution_id: data.institution_id,
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
    <Drawer
      direction="right"
      open={createDrawerOpen}
      onOpenChange={handleClose}
    >
      <DrawerContent className="overflow-y-auto overflow-x-hidden">
        <DrawerHeader
          aria-describedby={undefined}
          className="border-b sticky top-0 bg-background"
        >
          <DrawerTitle>Crear nueva donación</DrawerTitle>
          <DrawerDescription>
            Completa los datos para crear una nueva donación
          </DrawerDescription>
        </DrawerHeader>

        <form className="grid grid-cols-2 gap-4 p-4">
          <div className="grid gap-2 col-span-2">
            <Label htmlFor="institution_id">Institución</Label>
            <Select
              value={watch("institution_id")}
              onValueChange={(value) => {
                setValue("institution_id", value, { shouldValidate: true });
              }}
              disabled={loadingInstitutions || isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Selecciona una institución"
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
            {errors.institution_id && (
              <p className="text-sm text-red-500">
                {errors.institution_id.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 col-span-2">
            <Label htmlFor="donation_type">Tipo de donación</Label>
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
          </div>

          <div className="grid gap-2 col-span-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="delivery_method">Forma de entrega</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
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
              onValueChange={(value: "pickup" | "shipment" | "agreement") => {
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
            {errors.delivery_method && (
              <p className="text-sm text-red-500">
                {errors.delivery_method.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 col-span-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
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
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {donationType === "money" ? (
            <Fragment>
              <div className="grid gap-2 col-span-2">
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
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2 col-span-2">
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
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
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
                    <ImagePreview
                      src={imagePreview}
                      alt="Preview del comprobante"
                    />
                  </div>
                )}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="grid gap-2 col-span-2">
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

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <span className="text-xs text-gray-500">
                  Danos detalle de la donación, qué se ofrece, cómo se pretende
                  colaborar, qué recaudos hay que tener en cuenta (frágiles,
                  conservación, etc.). Sé tan específico como puedas, para que
                  los usuarios puedan entender mejor
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

              <div className="grid gap-2 col-span-2">
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
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
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
                    <ImagePreview
                      src={imagePreview}
                      alt="Preview de la imagen"
                    />
                  </div>
                )}
              </div>
            </Fragment>
          )}
        </form>

        <DrawerFooter className="border-t sticky bottom-0 bg-background">
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
            {isLoading ? "Creando..." : "Crear Donación"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
