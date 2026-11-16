"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import {
  DataTableFacetedFilter,
  type FacetedFilterOption,
} from "@/components/common/data-table-faceted-filter";

const PAGE_SIZE = 10;

export interface FacetedFilterConfig {
  columnId: string;
  title: string;
  options: readonly FacetedFilterOption[];
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  emptyMessage: string;
  countLabel: (count: number) => string;
  toolbar?: ReactNode;
  actions?: ReactNode;
  facetedFilters?: FacetedFilterConfig[];
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyMessage,
  countLabel,
  toolbar,
  actions,
  facetedFilters = [],
}: DataTableProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const page = Number(searchParams.get("page"));
  const pageIndex = Number.isInteger(page) && page > 1 ? page - 1 : 0;

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    setColumnFilters((previous) => functionalUpdate(updater, previous));
    if (searchParams.has("page")) {
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange,
    state: {
      sorting,
      columnFilters,
      pagination: { pageIndex, pageSize: PAGE_SIZE },
    },
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns().length;

  return (
    <div className="flex flex-col gap-4">
      {(toolbar || actions || facetedFilters.length > 0) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {facetedFilters.map((filter) => {
              const column = table.getColumn(filter.columnId);
              return column ? (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                />
              ) : null;
            })}
            {columnFilters.length > 0 && (
              <Button variant="ghost" size="lg" onClick={() => table.resetColumnFilters()}>
                Limpiar filtros
                <XIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns}
                  className="h-24 text-center"
                >
                  Cargando
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          {countLabel(table.getFilteredRowModel().rows.length)}
        </p>
        <DataTablePagination
          current={table.getState().pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
        />
      </div>
    </div>
  );
}
