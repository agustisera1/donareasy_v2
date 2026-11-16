"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChartLine, Eye } from "lucide-react";

import { DataTable } from "@/components/common/data-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { DataTableRowAction } from "@/components/common/data-table-row-action";
import { ViewInstitutionDrawer } from "./view-institution-drawer";
import { InstitutionMetricsDrawer } from "./institution-metrics-drawer";
import { useInstitutionsContext } from "@/contexts/institutions-context";
import { Institution } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function InstitutionsDataTable() {
  const {
    institutions: data,
    openViewDrawer,
    openMetricsDrawer,
    loading,
  } = useInstitutionsContext();

  const columns: ColumnDef<Institution>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "director",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Director a cargo" />
        ),
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha de fundación" />
        ),
        cell: ({ row }) => formatDate(row.original.foundation_date),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const institution = row.original;
          return (
            <div className="flex gap-1">
              <DataTableRowAction
                label="Ver detalle"
                icon={<Eye />}
                onClick={() => openViewDrawer(institution)}
              />
              <DataTableRowAction
                label="Ver métricas"
                icon={<ChartLine />}
                onClick={() => openMetricsDrawer(institution)}
              />
            </div>
          );
        },
      },
    ],
    [openViewDrawer, openMetricsDrawer]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No hay instituciones disponibles"
        countLabel={(count) => `${count} institución(es)`}
      />
      <ViewInstitutionDrawer />
      <InstitutionMetricsDrawer />
    </>
  );
}
