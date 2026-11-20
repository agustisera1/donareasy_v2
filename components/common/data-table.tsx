"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
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
import { CircleAlertIcon, InboxIcon, SearchXIcon, XIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { HistoryLink } from "@/components/common/history-link";
import {
  parseColumnFilters,
  parseSorting,
  serializeSorting,
  useSearchParamsState,
  writeColumnFilters,
} from "@/components/common/use-search-params-state";
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
  errorMessage?: string | null;
  emptyMessage: string;
  countLabel: (count: number) => string;
  toolbar?: ReactNode;
  actions?: ReactNode;
  facetedFilters?: FacetedFilterConfig[];
}

export function DataTable<TData>({
  columns,
  data,
  errorMessage,
  emptyMessage,
  countLabel,
  toolbar,
  actions,
  facetedFilters = [],
}: DataTableProps<TData>) {
  const pathname = usePathname();
  const { searchParams, replace } = useSearchParamsState();
  const filterIds = facetedFilters.map((filter) => filter.columnId);
  const rawSort = searchParams.get("sort");
  const rawFilters = filterIds.map((id) => `${id}=${searchParams.get(id) ?? ""}`).join("&");
  // La URL puede traer un orden de otra tabla: solo se aplica sobre columnas que existen acá.
  const columnIds = columns.map((column) => column.id ?? ("accessorKey" in column ? String(column.accessorKey) : ""));
  const sorting = parseSorting(rawSort).filter(({ id }) => columnIds.includes(id));
  const columnFilters = useMemo(() => {
    const params = new URLSearchParams(rawFilters);
    return parseColumnFilters(params, [...params.keys()]);
  }, [rawFilters]);

  const page = Number(searchParams.get("page"));
  const pageIndex = Number.isInteger(page) && page > 1 ? page - 1 : 0;

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = serializeSorting(functionalUpdate(updater, sorting));
    replace((params) => (next ? params.set("sort", next) : params.delete("sort")));
  };

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = functionalUpdate(updater, columnFilters);
    replace((params) => writeColumnFilters(params, filterIds, next));
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
    onSortingChange,
    autoResetPageIndex: false,
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
            {errorMessage ? (
              <StatusRow colSpan={visibleColumns}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleAlertIcon />
                    </EmptyMedia>
                    <EmptyTitle>{errorMessage}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </StatusRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageIndex > 0 && table.getPrePaginationRowModel().rows.length > 0 ? (
              <StatusRow colSpan={visibleColumns}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchXIcon />
                    </EmptyMedia>
                    <EmptyTitle>Esta página no existe</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild variant="outline">
                      <HistoryLink href={firstPageHref(pathname, searchParams)}>Ir a la primera página</HistoryLink>
                    </Button>
                  </EmptyContent>
                </Empty>
              </StatusRow>
            ) : columnFilters.length > 0 ? (
              <StatusRow colSpan={visibleColumns}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchXIcon />
                    </EmptyMedia>
                    <EmptyTitle>No hay resultados con estos filtros</EmptyTitle>
                    <EmptyDescription>Probá con otros valores o limpiá los filtros.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={() => table.resetColumnFilters()}>
                      Limpiar filtros
                    </Button>
                  </EmptyContent>
                </Empty>
              </StatusRow>
            ) : (
              <StatusRow colSpan={visibleColumns}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <InboxIcon />
                    </EmptyMedia>
                    <EmptyTitle>{emptyMessage}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              </StatusRow>
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

function StatusRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  );
}

function firstPageHref(pathname: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  params.delete("page");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
