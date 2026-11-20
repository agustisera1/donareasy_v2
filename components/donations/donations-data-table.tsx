"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Check, Edit, Eye, Package, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import { DataTableTabs } from "@/components/common/data-table-tabs";
import { acceptDonation } from "@/actions/donations/accept";
import { cancelDonation } from "@/actions/donations/cancel";
import { deliverDonation } from "@/actions/donations/deliver";
import { categoryTranslations } from "@/lib/constants";
import { canAccept, canDeliver, canEditOrCancel, canReject } from "@/lib/policies/donation";
import type { ServiceResult } from "@/lib/shared/result";
import type { DonationWithRelations as Donation, RoleName } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import { CreateDonationDrawer, type DonationCampaign } from "./create-donation-drawer";
import { donationTypeTabs, parseDonationTypeTab, type InstitutionOption } from "./donation-form-model";
import { EditDonationDrawer } from "./edit-donation-drawer";
import { RejectDonationDialog } from "./reject-donation-dialog";
import { StatusBadge } from "./status-badge";
import { ViewDonationDrawer } from "./view-donation-drawer";

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "accepted", label: "Aceptada" },
  { value: "rejected", label: "Rechazada" },
  { value: "delivered", label: "Entregada" },
];

const categoryOptions = (["supplies", "clothing", "food", "other"] as const).map((value) => ({
  value,
  label: categoryTranslations[value].label,
}));

type DonationsActor = { role: RoleName; entityId: string };
type Panel = "create" | "view" | "edit" | "cancel" | "accept" | "reject" | "deliver" | null;

interface DonationsDataTableProps {
  rows: Donation[] | null;
  actor: DonationsActor | null;
  institutions: InstitutionOption[];
  campaign: DonationCampaign | null;
}

export function DonationsDataTable({ rows, actor, institutions, campaign }: DonationsDataTableProps) {
  const router = useRouter();
  const type = parseDonationTypeTab(useSearchParams().get("type") ?? undefined);
  const visibleRows =
    type === "all" ? rows : rows?.filter((donation) => (donation.amount !== null) === (type === "money"));
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = rows?.find((donation) => donation.id === selectedId) ?? null;
  const isDonor = actor?.role === "donor";
  const isInstitution = actor?.role === "institution";
  const entityId = actor?.entityId ?? "";

  function open(next: Exclude<Panel, null>, donation?: Donation) {
    if (donation) setSelectedId(donation.id);
    setPanel(next);
  }

  function close(open: boolean) {
    if (!open) setPanel(null);
  }

  // "Donar" desde una campaña llega con ?campaign_id: el drawer abierto se deriva de la URL.
  function closeCreate(open: boolean) {
    if (open) return;
    setPanel(null);
    if (campaign) router.replace(pathname);
  }

  function confirmWith(action: (input: { donationId: number }) => Promise<ServiceResult<null>>, success: string) {
    return async () => {
      if (!selected) return;
      const result = await action({ donationId: selected.id });
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      toast.success(success);
    };
  }

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.amount !== null ? "Donación monetaria" : row.original.name || "Bienes"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      filterFn: "arrIncludesSome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "category",
      filterFn: "arrIncludesSome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
      accessorKey: "date_created",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de creación" />,
      cell: ({ row }) => formatDate(row.original.date_created),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const donation = row.original;
        const ownsPending = isDonor && canEditOrCancel(donation, entityId);

        return (
          <div className="flex gap-1">
            <DataTableRowAction label="Ver detalle" icon={<Eye />} onClick={() => open("view", donation)} />
            {ownsPending && (
              <>
                <DataTableRowAction label="Editar" icon={<Edit />} onClick={() => open("edit", donation)} />
                <DataTableRowAction
                  label="Cancelar donación"
                  icon={<Ban />}
                  onClick={() => open("cancel", donation)}
                />
              </>
            )}
            {isInstitution && canAccept(donation, entityId) && (
              <DataTableRowAction label="Aceptar" icon={<Package />} onClick={() => open("accept", donation)} />
            )}
            {isInstitution && canReject(donation, entityId) && (
              <DataTableRowAction label="Rechazar" icon={<X />} onClick={() => open("reject", donation)} />
            )}
            {isInstitution && canDeliver(donation, entityId) && (
              <DataTableRowAction
                label="Marcar como entregada"
                icon={<Check />}
                onClick={() => open("deliver", donation)}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={visibleRows ?? []}
        errorMessage={rows ? null : "No se pudieron cargar las donaciones. Recargá la página."}
        emptyMessage="No hay donaciones disponibles"
        countLabel={(count) => `${count} donación(es)`}
        toolbar={<DataTableTabs param="type" options={donationTypeTabs} value={type} />}
        actions={
          isDonor && (
            <Button size="lg" onClick={() => open("create")}>
              Nueva donación
            </Button>
          )
        }
        facetedFilters={[
          { columnId: "status", title: "Estado", options: statusOptions },
          { columnId: "category", title: "Categoría", options: categoryOptions },
        ]}
      />
      {isDonor && (
        <CreateDonationDrawer
          key={campaign?.campaignId ?? "new"}
          open={panel === "create" || !!campaign}
          onOpenChange={closeCreate}
          institutions={institutions}
          campaign={campaign}
        />
      )}
      {selected && (
        <>
          <ViewDonationDrawer donation={selected} open={panel === "view"} onOpenChange={close} />
          <EditDonationDrawer
            key={selected.id}
            donation={selected}
            open={panel === "edit"}
            onOpenChange={close}
          />
          <RejectDonationDialog
            key={`reject-${selected.id}`}
            donationId={selected.id}
            open={panel === "reject"}
            onOpenChange={close}
          />
          <ConfirmDialog
            open={panel === "cancel"}
            onOpenChange={close}
            title="¿Cancelar la donación?"
            description="La donación se elimina y ninguna institución la va a ver. No se puede deshacer."
            confirmLabel="Sí, cancelar"
            pendingLabel="Cancelando…"
            onConfirm={confirmWith(cancelDonation, "Donación cancelada")}
          />
          <ConfirmDialog
            open={panel === "accept"}
            onOpenChange={close}
            title="¿Aceptar la donación?"
            description="La donación queda aceptada y lista para coordinar la entrega."
            confirmLabel="Sí, aceptar"
            pendingLabel="Aceptando…"
            onConfirm={confirmWith(acceptDonation, "Donación aceptada")}
          />
          <ConfirmDialog
            open={panel === "deliver"}
            onOpenChange={close}
            title="¿Marcar como entregada?"
            description="Confirmá que la institución ya recibió la donación. No se puede deshacer."
            confirmLabel="Sí, entregada"
            pendingLabel="Guardando…"
            onConfirm={confirmWith(deliverDonation, "Donación marcada como entregada")}
          />
        </>
      )}
    </>
  );
}
