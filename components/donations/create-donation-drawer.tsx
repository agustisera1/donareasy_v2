"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { useDonationsContext } from "@/contexts/donations-context";
import { createClient } from "@/lib/supabase/client";
import { Institution } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { useSearchParams } from "next/navigation";
import { Fragment } from "react";

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
      donation_type: "money",
      amount: "",
      transfer_receipt: null,
      type: "",
    },
  });

  const donationType = watch("donation_type") as "money" | "goods";

  // Cargar instituciones al abrir el drawer
  useEffect(() => {
    if (createDrawerOpen) {
      loadInstitutions();
    }
  }, [createDrawerOpen]);

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
    closeCreateDrawer();
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
      let receiptUrl = "";
      let transferReceiptText = "";

      // El archivo ya está validado por Zod
      if (data.transfer_receipt && data.transfer_receipt.length > 0) {
        const file = data.transfer_receipt[0];
        // Por ahora, usar un mock URL (imagen pública de ejemplo)
        receiptUrl =
          "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop";
        transferReceiptText = file.name;
      }

      const donationData: {
        institution_id: string;
        donnor_id: string;
        receipt_url: string;
        status: "pending";
        type?: string | null;
        amount?: number | null;
        transfer_receipt?: string | null;
      } = {
        institution_id: data.institution_id,
        donnor_id: donor.id,
        receipt_url: receiptUrl,
        status: "pending",
      };

      if (data.donation_type === "money") {
        if (data.amount) {
          const amountNum = parseFloat(data.amount);
          if (!isNaN(amountNum)) {
            donationData.amount = amountNum;
          }
        }
        donationData.transfer_receipt = transferReceiptText || null;
        donationData.type = null;
      } else {
        donationData.type = data.type || null;
        donationData.transfer_receipt = transferReceiptText || null;
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
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
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

          {donationType === "money" ? (
            <Fragment>
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
                />
                {errors.transfer_receipt && (
                  <p className="text-sm text-red-500">
                    {errors.transfer_receipt.message as string}
                  </p>
                )}
              </div>

              {/* <ImagePreview src={watch("transfer_receipt")} /> */}
            </Fragment>
          ) : (
            <Fragment>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="transfer_receipt_goods">Imagen *</Label>
                <Input
                  id="transfer_receipt_goods"
                  type="file"
                  lang="es"
                  accept=".png,.jpg,.jpeg,.pdf"
                  {...register("transfer_receipt")}
                  disabled={isLoading}
                />
                {errors.transfer_receipt && (
                  <p className="text-sm text-red-500">
                    {errors.transfer_receipt.message as string}
                  </p>
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
            {isLoading ? "Creando..." : "Crear Donación"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
