"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Edit, Eye, HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import { DataTableTabs, parseTab } from "@/components/common/data-table-tabs";
import { ViewCampaignDrawer } from "./view-campaign-drawer";
import { EditCampaignDrawer } from "./edit-campaign-drawer";
import { FinishCampaignDialog } from "./finish-campaign-dialog";
import { useCampaignsContext } from "@/contexts/campaigns-context";
import { Campaign } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const viewOptions = [
  { value: "all", label: "Todas" },
  { value: "mine", label: "Mis campañas" },
] as const;

const statusOptions = [
  { value: "active", label: "Activa" },
  { value: "finished", label: "Finalizada" },
];

export function CampaignsDataTable() {
  const {
    campaigns: data,
    institution,
    isInstitution,
    openCreateDrawer,
    openEditDrawer,
    openViewDrawer,
    openFinishDialog,
    loading,
    error,
  } = useCampaignsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseTab(searchParams.get("view"), viewOptions);

  const filteredData = useMemo(
    () =>
      view === "mine" && institution?.id
        ? data.filter((campaign) => campaign.institution_id === institution.id)
        : data,
    [data, view, institution],
  );

  const columns: ColumnDef<Campaign>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tipo" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "start_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha de inicio" />
        ),
        cell: ({ row }) => formatDate(row.original.start_date),
      },
      {
        accessorKey: "termination_date",
        header: "Fecha de finalización",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.termination_date
            ? formatDate(row.original.termination_date)
            : "Sin especificar",
      },
      {
        id: "status",
        accessorFn: (campaign) => (campaign.finished ? "finished" : "active"),
        enableSorting: false,
        filterFn: "arrIncludesSome",
        header: "Estado",
        cell: ({ row }) => {
          const isFinished = row.original.finished === true;
          return (
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isFinished
                  ? "bg-muted text-muted-foreground"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {isFinished ? "Finalizada" : "Activa"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const campaign = row.original;
          const canDonate = campaign.finished === false && !isInstitution;
          const redirectUrl = `/dashboard/donations?campaign_id=${campaign.id}&institution_id=${campaign.institution_id}`;
          const canEdit =
            isInstitution && campaign.institution_id === institution?.id;

          return (
            <div className="flex gap-1">
              <DataTableRowAction
                label="Ver detalle"
                icon={<Eye />}
                onClick={() => openViewDrawer(campaign)}
              />
              {canDonate && (
                <DataTableRowAction
                  label="Donar"
                  icon={<HandCoins />}
                  onClick={() => router.push(redirectUrl)}
                />
              )}
              {canEdit && (
                <>
                  <DataTableRowAction
                    label="Editar"
                    icon={<Edit />}
                    onClick={() => openEditDrawer(campaign)}
                    disabled={campaign.finished === true}
                  />
                  <DataTableRowAction
                    label="Finalizar"
                    icon={<Check />}
                    onClick={() => openFinishDialog(campaign)}
                    disabled={campaign.finished === true}
                  />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [
      isInstitution,
      institution,
      openEditDrawer,
      openViewDrawer,
      openFinishDialog,
      router,
    ],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        errorMessage={error ? "No se pudieron cargar las campañas. Recargá la página." : null}
        emptyMessage="No hay campañas disponibles"
        countLabel={(count) => `${count} campaña(s)`}
        toolbar={
          isInstitution &&
          !loading && (
            <DataTableTabs param="view" options={viewOptions} value={view} />
          )
        }
        actions={
          isInstitution &&
          !loading && (
            <Button size="lg" onClick={openCreateDrawer}>
              Nueva campaña
            </Button>
          )
        }
        facetedFilters={[
          { columnId: "status", title: "Estado", options: statusOptions },
        ]}
      />
      <ViewCampaignDrawer />
      <EditCampaignDrawer />
      <FinishCampaignDialog />
    </>
  );
}
