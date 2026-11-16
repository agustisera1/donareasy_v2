"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Edit, Eye, Package, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import { DataTableTabs, parseTab } from "@/components/common/data-table-tabs";
import { ViewDonationDrawer } from "./view-donation-drawer";
import { EditDonationDrawer } from "./edit-donation-drawer";
import { AcceptDonationDialog } from "./accept-donation-dialog";
import { RejectDonationDialog } from "./reject-donation-dialog";
import { DeliverDonationDialog } from "./deliver-donation-dialog";
import { CreateDonationDrawer } from "./create-donation-drawer";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { useDonationsContext } from "@/contexts/donations-context";
import { Donation } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { categoryTranslations } from "@/lib/constants";

const viewOptions = [
  { value: "all", label: "Todas" },
  { value: "mine", label: "Mis donaciones" },
] as const;

const typeOptions = [
  { value: "all", label: "Todas" },
  { value: "money", label: "Monetarias" },
  { value: "goods", label: "Bienes" },
] as const;

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "accepted", label: "Aceptada" },
  { value: "rejected", label: "Rechazada" },
  { value: "delivered", label: "Entregada" },
];

const categoryOptions = (["supplies", "clothing", "food", "other"] as const).map(
  (value) => ({ value, label: categoryTranslations[value].label }),
);

export function DonationsDataTable() {
  const {
    donations: data,
    donor,
    institution,
    isDonor,
    isInstitution,
    loading,
    openCreateDrawer,
    openViewDrawer,
    openEditDrawer,
    openAcceptDialog,
    openRejectDialog,
    openDeliverDialog,
  } = useDonationsContext();
  const searchParams = useSearchParams();
  const view = parseTab(searchParams.get("view"), viewOptions);
  const donationType = parseTab(searchParams.get("type"), typeOptions);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (view === "mine" && donor?.id) {
      filtered = filtered.filter((donation) => donation.donor_id === donor.id);
    }
    if (donationType === "money") {
      filtered = filtered.filter((donation) => donation.amount !== null);
    } else if (donationType === "goods") {
      filtered = filtered.filter((donation) => donation.amount === null);
    }
    return filtered;
  }, [data, view, donationType, donor]);

  const columns: ColumnDef<Donation>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => {
          const donation = row.original;
          return (
            <span className="font-medium">
              {donation.amount !== null
                ? "Donación monetaria"
                : donation.name || "Bienes"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        filterFn: "arrIncludesSome",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "category",
        filterFn: "arrIncludesSome",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Categoría" />
        ),
        cell: ({ row }) => <CategoryBadge category={row.original.category} />,
      },
      {
        accessorKey: "date_created",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha de creación" />
        ),
        cell: ({ row }) => formatDate(row.original.date_created),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const donation = row.original;
          const canEdit = isDonor && donation.donor_id === donor?.id;
          const isOpenDonation =
            donation.institution_id === null && donation.status === "pending";
          const isOwnInstitutionDonation =
            isInstitution && donation.institution_id === institution?.id;
          const canAccept =
            (isOwnInstitutionDonation || (isInstitution && isOpenDonation)) &&
            donation.status === "pending";
          const canReject =
            isOwnInstitutionDonation && donation.status === "pending";
          const canDeliver =
            isOwnInstitutionDonation && donation.status === "accepted";

          return (
            <div className="flex gap-1">
              <DataTableRowAction
                label="Ver detalle"
                icon={<Eye />}
                onClick={() => openViewDrawer(donation)}
              />
              {canEdit && (
                <DataTableRowAction
                  label="Editar"
                  icon={<Edit />}
                  onClick={() => openEditDrawer(donation)}
                  disabled={donation.status !== "pending"}
                />
              )}
              {canAccept && (
                <DataTableRowAction
                  label="Aceptar"
                  icon={<Package />}
                  onClick={() => openAcceptDialog(donation)}
                />
              )}
              {canReject && (
                <DataTableRowAction
                  label="Rechazar"
                  icon={<X />}
                  onClick={() => openRejectDialog(donation)}
                />
              )}
              {canDeliver && (
                <DataTableRowAction
                  label="Marcar como entregada"
                  icon={<Check />}
                  onClick={() => openDeliverDialog(donation)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [
      isDonor,
      isInstitution,
      donor,
      openViewDrawer,
      openEditDrawer,
      openAcceptDialog,
      openRejectDialog,
      openDeliverDialog,
      institution?.id,
    ]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No hay donaciones disponibles"
        countLabel={(count) => `${count} donación(es)`}
        toolbar={
          <>
            {isDonor && (
              <DataTableTabs param="view" options={viewOptions} value={view} />
            )}
            <DataTableTabs param="type" options={typeOptions} value={donationType} />
          </>
        }
        actions={
          isDonor && <Button size="lg" onClick={openCreateDrawer}>Nueva donación</Button>
        }
        facetedFilters={[
          { columnId: "status", title: "Estado", options: statusOptions },
          { columnId: "category", title: "Categoría", options: categoryOptions },
        ]}
      />
      <CreateDonationDrawer />
      <ViewDonationDrawer />
      <EditDonationDrawer />
      <AcceptDonationDialog />
      <RejectDonationDialog />
      <DeliverDonationDialog />
    </>
  );
}
