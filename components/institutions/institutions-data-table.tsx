"use client";

import { useState, useMemo } from "react";
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
import { ArrowUpDown, Eye, ChartLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewInstitutionDrawer } from "./view-institution-drawer";
import { InstitutionMetricsDrawer } from "./institution-metrics-drawer";
import { useInstitutionsContext } from "@/contexts/institutions-context";
import { Institution } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function InstitutionsDataTable() {
  const {
    institutions: data,
    openViewDrawer,
    openMetricsDrawer,
    loading,
  } = useInstitutionsContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Institution>[] = useMemo(
    () => [
      {
        size: 160,
        minSize: 160,
        maxSize: 160,
        accessorKey: "name",
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Nombre
              </span>
              <Button
                className="px-2 flex justify-start"
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "director",
        size: 100,
        minSize: 100,
        maxSize: 100,
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Director a cargo
              </span>
              <Button
                className="px-2 flex justify-start"
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("director")}</div>,
      },
      {
        accessorKey: "city",
        size: 80,
        minSize: 80,
        maxSize: 80,
        header: "Ciudad",
        cell: ({ row }) => {
          return <div>{row.getValue("city")}</div>;
        },
      },
      {
        accessorKey: "province",
        size: 100,
        minSize: 100,
        maxSize: 100,
        header: "Provincia",
        cell: ({ row }) => {
          return <div>{row.getValue("province")}</div>;
        },
      },
      {
        accessorKey: "foundation_date",
        size: 110,
        minSize: 110,
        maxSize: 110,
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Fecha de fundación
              </span>
              <Button
                className="px-2 flex justify-start"
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          return <div>{formatDate(row.getValue("foundation_date"))}</div>;
        },
      },
      {
        size: 80,
        minSize: 80,
        maxSize: 80,
        id: "actions",
        enableHiding: false,
        header: "",
        cell: ({ row }) => {
          const institution = row.original;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openViewDrawer(institution)}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openMetricsDrawer(institution)}
                title="Métricas"
              >
                <ChartLine className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [openViewDrawer, openMetricsDrawer]
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
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
    <div className="w-full space-y-4 min-h-[calc(100dvh-10rem)]">
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                        maxWidth: `${header.column.columnDef.maxSize ?? 100}px`,
                        minWidth: `${header.column.columnDef.minSize ?? 100}px`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center"
                >
                  Cargando
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        maxWidth: `${cell.column.columnDef.maxSize ?? 100}px`,
                        minWidth: `${cell.column.columnDef.minSize ?? 100}px`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
                >
                  No hay instituciones disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} institución(es)
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

      <ViewInstitutionDrawer />
      <InstitutionMetricsDrawer />
    </div>
  );
}
