"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ChartLine, Check, Edit, Eye, HandCoins } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import { DataTableTabs, parseTab } from "@/components/common/data-table-tabs";
import { finishCampaign } from "@/actions/campaign/finish";
import type { CampaignWithInstitution as Campaign, RoleName } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CampaignMetricsDrawer } from "./campaign-metrics-drawer";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CreateCampaignDrawer } from "./create-campaign-drawer";
import { EditCampaignDrawer } from "./edit-campaign-drawer";
import { ViewCampaignDrawer } from "./view-campaign-drawer";

const viewOptions = [
  { value: "all", label: "Todas" },
  { value: "mine", label: "Mis campañas" },
] as const;

const statusOptions = [
  { value: "active", label: "Activa" },
  { value: "finished", label: "Finalizada" },
];

type CampaignsActor = { role: RoleName; entityId: string };
type Panel = "create" | "view" | "metrics" | "edit" | "finish" | null;

interface CampaignsDataTableProps {
  rows: Campaign[] | null;
  actor: CampaignsActor | null;
}

export function CampaignsDataTable({ rows, actor }: CampaignsDataTableProps) {
  const view = parseTab(useSearchParams().get("view"), viewOptions);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows?.find((campaign) => campaign.id === selectedId) ?? null;
  const isInstitution = actor?.role === "institution";
  const visibleRows =
    view === "mine" && isInstitution
      ? rows?.filter((campaign) => campaign.institution_id === actor.entityId)
      : rows;

  function open(next: Exclude<Panel, null>, campaign?: Campaign) {
    if (campaign) setSelectedId(campaign.id);
    setPanel(next);
  }

  function close(open: boolean) {
    if (!open) setPanel(null);
  }

  async function handleFinish() {
    if (!selected) return;
    const result = await finishCampaign({ campaignId: selected.id });
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("Campaña finalizada");
  }

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <span className="font-medium">{row.original.type}</span>,
    },
    {
      id: "institution",
      accessorFn: (campaign) => campaign.institution?.name ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Institución" />,
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de inicio" />,
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "termination_date",
      header: "Fecha de finalización",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.termination_date ? formatDate(row.original.termination_date) : "Sin especificar",
    },
    {
      id: "status",
      accessorFn: (campaign) => (campaign.finished ? "finished" : "active"),
      enableSorting: false,
      filterFn: "arrIncludesSome",
      header: "Estado",
      cell: ({ row }) => <CampaignStatusBadge finished={row.original.finished} />,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const campaign = row.original;
        const canDonate = !campaign.finished && actor?.role === "donor";
        const canManage = isInstitution && campaign.institution_id === actor?.entityId;
        const donateHref = `/dashboard/donations?${new URLSearchParams({
          campaign_id: campaign.id,
          institution_id: campaign.institution_id,
        })}`;

        return (
          <div className="flex gap-1">
            <DataTableRowAction label="Ver detalle" icon={<Eye />} onClick={() => open("view", campaign)} />
            <DataTableRowAction
              label="Ver métricas"
              icon={<ChartLine />}
              onClick={() => open("metrics", campaign)}
            />
            {canDonate && <DataTableRowAction label="Donar" icon={<HandCoins />} href={donateHref} />}
            {canManage && (
              <>
                <DataTableRowAction
                  label="Editar"
                  icon={<Edit />}
                  onClick={() => open("edit", campaign)}
                  disabled={campaign.finished}
                />
                <DataTableRowAction
                  label="Finalizar"
                  icon={<Check />}
                  onClick={() => open("finish", campaign)}
                  disabled={campaign.finished}
                />
              </>
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
        errorMessage={rows ? null : "No se pudieron cargar las campañas. Recargá la página."}
        emptyMessage={view === "mine" ? "Todavía no creaste campañas" : "No hay campañas disponibles"}
        countLabel={(count) => `${count} campaña(s)`}
        toolbar={isInstitution && <DataTableTabs param="view" options={viewOptions} value={view} />}
        actions={
          isInstitution && (
            <Button size="lg" onClick={() => open("create")}>
              Nueva campaña
            </Button>
          )
        }
        facetedFilters={[{ columnId: "status", title: "Estado", options: statusOptions }]}
        search={{ placeholder: "Buscar por nombre o institución…", columnIds: ["type", "institution"] }}
      />
      {isInstitution && <CreateCampaignDrawer open={panel === "create"} onOpenChange={close} />}
      {selected && (
        <>
          <ViewCampaignDrawer campaign={selected} open={panel === "view"} onOpenChange={close} />
          <CampaignMetricsDrawer campaign={selected} open={panel === "metrics"} onOpenChange={close} />
          <EditCampaignDrawer
            key={selected.id}
            campaign={selected}
            open={panel === "edit"}
            onOpenChange={close}
          />
          <ConfirmDialog
            open={panel === "finish"}
            onOpenChange={close}
            title="¿Finalizar la campaña?"
            description="La campaña deja de recibir donaciones. No se puede deshacer."
            confirmLabel="Sí, finalizar"
            pendingLabel="Finalizando…"
            onConfirm={handleFinish}
          />
        </>
      )}
    </>
  );
}
