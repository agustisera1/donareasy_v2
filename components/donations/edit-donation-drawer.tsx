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
import Image from "next/image";

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
  } = useForm<DonationEditFormData>({
    resolver: zodResolver(donationEditSchema),
    mode: "onChange",
    defaultValues: {
      type: "",
      amount: "",
      transfer_receipt: null,
    },
  });

  const transferReceipt = watch("transfer_receipt");

  // Actualizar valores del formulario cuando se abre el drawer o cuando cambian los datos de la donación
  useEffect(() => {
    if (!editDrawerOpen || !selectedDonation) return;

    reset({
      type: selectedDonation.type || "",
      amount: selectedDonation.amount?.toString() || "",
      transfer_receipt: null,
    });

    // Guardar la URL de la imagen actual de la DB
    const dbImageUrl = selectedDonation.receipt_url || null;
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

      if (data.transfer_receipt && data.transfer_receipt.length > 0) {
        const file = data.transfer_receipt[0];
        // Por ahora, usar un mock URL (imagen pública de ejemplo)
        receiptUrl =
          "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop";
        transferReceiptText = file.name;
      }

      const updateData: {
        type?: string | null;
        amount?: number | null;
        transfer_receipt?: string | null;
        receipt_url?: string;
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
        updateData.receipt_url = receiptUrl;
        updateData.transfer_receipt = transferReceiptText;
      }
      // Si no se subió archivo, no actualizar receipt_url ni transfer_receipt

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
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Editar donación</DrawerTitle>
          <DrawerDescription>Editar los datos de la donación</DrawerDescription>
        </DrawerHeader>

        <form className="grid grid-cols-2 gap-4 p-4">
          {isMoney ? (
            <Fragment>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="transfer_receipt">
                  Comprobante de transferencia
                </Label>
                <Input
                  id="transfer_receipt"
                  type="file"
                  lang="es"
                  accept=".png,.jpg,.jpeg,.pdf"
                  {...register("transfer_receipt")}
                  disabled={isLoading}
                  ref={fileInputRef}
                />
                {errors.transfer_receipt && (
                  <p className="text-sm text-red-500">
                    {errors.transfer_receipt.message as string}
                  </p>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <div className="relative w-full h-64 rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview del comprobante"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="amount">Monto *</Label>
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
                <Label htmlFor="transfer_receipt_goods">Imagen</Label>
                <Input
                  id="transfer_receipt_goods"
                  type="file"
                  lang="es"
                  accept=".png,.jpg,.jpeg,.pdf"
                  {...register("transfer_receipt")}
                  disabled={isLoading}
                  ref={fileInputRef}
                />
                {errors.transfer_receipt && (
                  <p className="text-sm text-red-500">
                    {errors.transfer_receipt.message as string}
                  </p>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <div className="relative w-full h-64 rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview de la imagen"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="type">Descripción *</Label>
                <Textarea
                  id="type"
                  {...register("type")}
                  placeholder="Ej: Alimentos, Ropa, Medicamentos..."
                  disabled={isLoading}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
            </Fragment>
          )}
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
