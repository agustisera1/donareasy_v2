"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, Fragment } from "react";
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
  donationEditSchema,
  type DonationEditFormSchema,
} from "@/lib/validations";
import { updateDonation } from "@/actions/donations/update";
import { useState } from "react";
import { toast } from "sonner";
import { useDonationsContext } from "@/contexts/donations-context";
import { ImagePreview } from "./image-preview";
import { Trash2 } from "lucide-react";

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
      type: "",
      amount: "",
      attachment_name: null,
    },
  });

  const transferReceipt = watch("attachment_name");

  // Actualizar valores del formulario cuando se abre el drawer o cuando cambian los datos de la donación
  useEffect(() => {
    if (!editDrawerOpen || !selectedDonation) return;

    reset({
      type: selectedDonation.type || "",
      amount: selectedDonation.amount?.toString() || "",
      attachment_name: null,
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
        // Por ahora, usar un mock URL (imagen pública de ejemplo)
        receiptUrl =
          "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop";
        transferReceiptText = file.name;
      }

      const updateData: {
        type?: string | null;
        amount?: number | null;
        attachment_name?: string | null;
        attachment_url?: string;
      } = {};

      if (data.type) updateData.type = data.type;
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
    <Drawer direction="right" open={editDrawerOpen} onOpenChange={handleClose}>
      <DrawerContent className="overflow-y-auto overflow-x-hidden">
        <DrawerHeader
          aria-describedby={undefined}
          className="border-b sticky top-0 bg-background"
        >
          <DrawerTitle>Editar donación</DrawerTitle>
          <DrawerDescription>Editar los datos de la donación</DrawerDescription>
        </DrawerHeader>

        <form className="grid grid-cols-2 gap-4 p-4">
          {isMoney ? (
            <Fragment>
              <div className="grid gap-2 col-span-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="attachment_name" className="flex-1">
                    Comprobante de transferencia
                  </Label>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearImage}
                      disabled={isLoading}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  id="attachment_name"
                  type="file"
                  lang="es"
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
            </Fragment>
          ) : (
            <Fragment>
              <div className="grid gap-2 col-span-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="attachment_name" className="flex-1">
                    Vista previa
                  </Label>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearImage}
                      disabled={isLoading}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  id="attachment_name"
                  type="file"
                  lang="es"
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

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="type">Descripción</Label>
                <span className="text-xs text-gray-500">
                  Danos detalle de la donación, qué se ofrece, cómo se pretende
                  colaborar, qué recaudos hay que tener en cuenta (frágiles,
                  conservación, etc.). Sé tan específico como puedas, para que
                  los usuarios puedan entender mejor
                </span>
                <Textarea
                  id="type"
                  {...register("type")}
                  disabled={isLoading}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
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
            {isLoading ? "Actualizando..." : "Guardar Cambios"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
