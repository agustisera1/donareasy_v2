"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChartLine, Eye } from "lucide-react";

import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import type { Institution } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { InstitutionMetricsDrawer } from "./institution-metrics-drawer";
import { ViewInstitutionDrawer } from "./view-institution-drawer";

type Panel = "view" | "metrics" | null;

interface InstitutionsDataTableProps {
  rows: Institution[] | null;
}

export function InstitutionsDataTable({ rows }: InstitutionsDataTableProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows?.find((institution) => institution.id === selectedId) ?? null;

  function open(next: Exclude<Panel, null>, institution: Institution) {
    setSelectedId(institution.id);
    setPanel(next);
  }

  function close(open: boolean) {
    if (!open) setPanel(null);
  }

  const columns: ColumnDef<Institution>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "director",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Director a cargo" />,
    },
    {
      accessorKey: "city",
      header: "Ciudad",
      enableSorting: false,
    },
    {
      accessorKey: "province",
      header: "Provincia",
      enableSorting: false,
    },
    {
      accessorKey: "foundation_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de fundación" />,
      cell: ({ row }) => formatDate(row.original.foundation_date),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <DataTableRowAction label="Ver detalle" icon={<Eye />} onClick={() => open("view", row.original)} />
          <DataTableRowAction
            label="Ver métricas"
            icon={<ChartLine />}
            onClick={() => open("metrics", row.original)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rows ?? []}
        errorMessage={rows ? null : "No se pudieron cargar las instituciones. Recargá la página."}
        emptyMessage="No hay instituciones disponibles"
        countLabel={(count) => `${count} institución(es)`}
        search={{
          placeholder: "Buscar por nombre, director o ubicación…",
          columnIds: ["name", "director", "city", "province"],
        }}
      />
      {selected && (
        <>
          <ViewInstitutionDrawer institution={selected} open={panel === "view"} onOpenChange={close} />
          <InstitutionMetricsDrawer institution={selected} open={panel === "metrics"} onOpenChange={close} />
        </>
      )}
    </>
  );
}
