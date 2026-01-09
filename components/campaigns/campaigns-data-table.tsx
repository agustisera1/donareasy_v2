"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, Check, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ViewCampaignDrawer } from "./view-campaign-drawer";
import { EditCampaignDrawer } from "./edit-campaign-drawer";
import { FinishCampaignDialog } from "./finish-campaign-dialog";
import { useCampaignsContext } from "@/contexts/campaigns-context";
import { Campaign } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export function CampaignsDataTable() {
  const {
    loading,
    campaigns: data,
    institution,
    isInstitution,
    openCreateDrawer,
    openEditDrawer,
    openViewDrawer,
    openFinishDialog,
  } = useCampaignsContext();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [filterMode, setFilterMode] = React.useState<"all" | "mine">("all");

  // Filtrar datos según el modo de filtro
  const filteredData = React.useMemo(() => {
    if (filterMode === "mine" && institution?.id) {
      return data.filter(
        (campaign) => campaign.institution_id === institution.id
      );
    }
    return data;
  }, [data, filterMode, institution]);

  const columns: ColumnDef<Campaign>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Tipo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("type")}</div>
        ),
      },
      {
        accessorKey: "start_date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Fecha de inicio
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{formatDate(row.getValue("start_date"))}</div>;
        },
      },
      {
        accessorKey: "termination_date",
        header: "Fecha de finalización",
        cell: ({ row }) => {
          const terminationDate = row.getValue("termination_date") as
            | string
            | null;

          console.log(terminationDate, formatDate(terminationDate!));
          return (
            <div>
              {terminationDate
                ? formatDate(terminationDate)
                : "Sin especificar"}
            </div>
          );
        },
      },
      {
        accessorKey: "finished",
        header: "Estado",
        cell: ({ row }) => {
          const finished = row.getValue("finished") as boolean | null;
          const isFinished = finished === true;
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
        enableHiding: false,
        header: "",
        cell: ({ row }) => {
          const campaign = row.original;
          const canEdit =
            isInstitution && campaign.institution_id === institution?.id;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openViewDrawer(campaign)}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {canEdit && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEditDrawer(campaign)}
                    title="Editar"
                    disabled={campaign.finished === true}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openFinishDialog(campaign)}
                    title="Finalizar"
                    disabled={campaign.finished === true}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
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
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isInstitution && (
            <ToggleGroup
              type="single"
              value={filterMode}
              onValueChange={(value) => {
                if (value === "all" || value === "mine") {
                  setFilterMode(value);
                }
              }}
            >
              <ToggleGroupItem
                className="hover:text-primary"
                value="all"
                aria-label="Todas las campañas"
              >
                Todas
              </ToggleGroupItem>
              <ToggleGroupItem
                className="hover:text-primary"
                value="mine"
                aria-label="Mis campañas"
              >
                Mis campañas
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
        {isInstitution && (
          <Button onClick={openCreateDrawer}>Nueva Campaña</Button>
        )}
      </div>

      <div className="rounded-md border">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-12 text-center"
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} campaña(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <ViewCampaignDrawer />
      <EditCampaignDrawer />
      <FinishCampaignDialog />
    </div>
  );
}
