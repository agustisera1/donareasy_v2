"use client";

import React, { Fragment } from "react";
import {
  Column,
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
import { ArrowUpDown, Edit, X, Eye, Check, Package, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { cn, formatDate } from "@/lib/utils";
import { categoryTranslations } from "@/lib/constants";

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

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [filterMode, setFilterMode] = React.useState<"all" | "mine">("all");
  const [donationType, setDonationType] = React.useState<
    "all" | "money" | "goods"
  >("all");

  // Filtrar datos según el modo de filtro y tipo de donación
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Filtrar por propietario
    if (filterMode === "mine" && donor?.id) {
      filtered = filtered.filter((donation) => donation.donor_id === donor.id);
    }

    // Filtrar por tipo de donación
    if (donationType === "money") {
      filtered = filtered.filter((donation) => donation.amount !== null);
    } else if (donationType === "goods") {
      filtered = filtered.filter((donation) => donation.amount === null);
    }

    return filtered;
  }, [data, filterMode, donationType, donor]);

  const FilterOption = ({ value, label, column }: { value: string, label: string, column: Column<Donation> }) => {
    const isSelected = column.getFilterValue() === value
    return (
      <Button
        variant="ghost"
        size="sm"
        className="justify-between h-8 p-2"
        onClick={() => column.setFilterValue(value)}
      >
        {label}
        {isSelected && <Check className="w-4" />}
      </Button>
    )
  }

  const columns: ColumnDef<Donation>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        size: 100,
        minSize: 100,
        maxSize: 100,
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
        cell: ({ row }) => {
          const donation = row.original;
          const isMoney = donation.amount !== null;
          return (
            <div className="font-medium">
              {isMoney ? "Donación monetaria" : donation.name || "Bienes"}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        size: 150,
        minSize: 150,
        maxSize: 200,
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Detalle
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
          const donation = row.original;
          return (
            <Fragment>
              {donation.amount === null && donation.description === null && (
                <div className="text-muted-foreground">-</div>
              )}
              {donation.description !== null && donation.description}
              {donation.amount !== null &&
                `$${donation.amount.toLocaleString()}`}
            </Fragment>
          );
        },
      },
      {
        accessorKey: "status",
        size: 80,
        minSize: 80,
        maxSize: 80,
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.getValue(id) === value;
        },
        header: ({ column }) => {
          const handleSorting = () => {
            column.toggleSorting(column.getIsSorted() === "asc");
          };

          const isFiltered = column.getIsFiltered()
          const isSorted = column.getIsSorted()
          const filterValue = column.getFilterValue()
          const options = [{ value: "all", label: "Todos" }, { value: "pending", label: "Pendiente" }, { value: "accepted", label: "Aceptada" }, { value: "rejected", label: "Rechazada" }, { value: "delivered", label: "Entregada" }]
          return (
            <div className="flex items-center items-between gap-1 px-2">
              <span>
                Estado
              </span>
              <div className="flex items-center">
                <Button
                  className="px-2 flex justify-start"
                  variant="ghost"
                  onClick={handleSorting}

                >
                  <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Filtrar por estado"
                    >
                      <Tag className={cn("h-4 w-4", isFiltered && filterValue !== "all" ? "text-yellow-500" : "text-muted-foreground")} />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-28 p-1">
                    <div className="flex flex-col">
                      {options.map((option) => (
                        <FilterOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          column={column}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div >
            </div>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as
            | "accepted"
            | "rejected"
            | "pending"
            | "delivered";
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "category",
        size: 130,
        minSize: 130,
        maxSize: 130,
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.getValue(id) === value;
        },
        header: ({ column }) => {
          const handleSorting = () => {
            column.toggleSorting(column.getIsSorted() === "asc");
          };
          const isSorted = column.getIsSorted()
          const isFiltered = column.getIsFiltered()
          const filterValue = column.getFilterValue()
          const options = [{ value: "all", label: "Todos" }, { value: "supplies", label: categoryTranslations.supplies.label }, { value: "clothing", label: categoryTranslations.clothing.label }, { value: "food", label: categoryTranslations.food.label }, { value: "other", label: categoryTranslations.other.label }]
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Categoría
              </span>
              <div className="flex items-center">

                <Button
                  className="px-2 flex justify-start"
                  variant="ghost"
                  onClick={handleSorting}
                >
                  <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Filtrar por categoría"
                    >
                      <Tag className={cn("h-4 w-4", isFiltered && filterValue !== "all" ? "text-yellow-500" : "text-muted-foreground")} />
                    </Button>

                  </PopoverTrigger>
                  <PopoverContent className="w-58 p-1">
                    <div className="flex flex-col">
                      {options.map((option) => (
                        <FilterOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          column={column}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          );
        },
        cell: ({ row }) => {
          const category = row.getValue("category") as
            | "supplies"
            | "clothing"
            | "food"
            | "other";
          return <CategoryBadge category={category} />
        },
      },
      {
        accessorKey: "date_created",
        size: 120,
        minSize: 120,
        maxSize: 120,
        header: ({ column }) => {
          const handleSorting = () => {
            column.toggleSorting(column.getIsSorted() === "asc");
          };
          const isSorted = column.getIsSorted()
          return (
            <div className="flex items-center justify-between gap-1 px-2">
              <span>
                Fecha de creación
              </span>
              <div className="flex items-center">
                <Button
                  className="px-2 flex justify-start"
                  variant="ghost"
                  onClick={handleSorting}
                >
                  <ArrowUpDown className={cn("h-4 w-4", isSorted ? "text-yellow-500" : "text-muted-foreground")} />
                </Button>
              </div>
            </div>
          );
        },
        cell: ({ row }) => {
          return <div>{formatDate(row.getValue("date_created"))}</div>;
        },
      },
      {
        id: "actions",
        size: 60,
        minSize: 60,
        maxSize: 60,
        enableHiding: false,
        header: "",
        cell: ({ row }) => {
          const donation = row.original;
          const canEdit = isDonor && donation.donor_id === donor?.id;
          const isOwnInstitutionDonation =
            isInstitution && donation.institution_id === institution?.id;
          const canAccept =
            isOwnInstitutionDonation && donation.status === "pending";
          const canReject =
            isOwnInstitutionDonation && donation.status === "pending";
          const canDeliver =
            isOwnInstitutionDonation && donation.status === "accepted";

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openViewDrawer(donation)}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openEditDrawer(donation)}
                  title="Editar"
                  disabled={donation.status !== "pending"}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canAccept && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openAcceptDialog(donation)}
                  title="Aceptar"
                >
                  <Package className="h-4 w-4" />
                </Button>
              )}
              {canReject && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openRejectDialog(donation)}
                  title="Rechazar"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {canDeliver && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openDeliverDialog(donation)}
                  title="Marcar como entregada"
                >
                  <Check className="h-4 w-4" />
                </Button>
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

  const table = useReactTable({
    data: filteredData,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isDonor && (
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
                aria-label="Todas las donaciones"
              >
                Todas
              </ToggleGroupItem>
              <ToggleGroupItem
                className="hover:text-primary"
                value="mine"
                aria-label="Mis donaciones"
              >
                Mis donaciones
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          <ToggleGroup
            type="single"
            value={donationType}
            onValueChange={(value) => {
              if (value === "all" || value === "money" || value === "goods") {
                setDonationType(value);
              }
            }}
          >
            <ToggleGroupItem
              className="hover:text-primary"
              value="all"
              aria-label="Todas"
            >
              Todas
            </ToggleGroupItem>
            <ToggleGroupItem
              className="hover:text-primary"
              value="money"
              aria-label="Monetarias"
            >
              Monetarias
            </ToggleGroupItem>
            <ToggleGroupItem
              className="hover:text-primary"
              value="goods"
              aria-label="Bienes"
            >
              Bienes
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        {isDonor && <Button onClick={openCreateDrawer}>Nueva donación</Button>}
      </div>

      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="pl-0"
                      style={{
                        width: `${header.getSize()}px`,
                        maxWidth: `${header.column.columnDef.maxSize ?? 100}px`,
                        minWidth: `${header.column.columnDef.minSize ?? 100}px`,
                        overflow: 'hidden'
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
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} donación(es)
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

      <CreateDonationDrawer />
      <ViewDonationDrawer />
      <EditDonationDrawer />
      <AcceptDonationDialog />
      <RejectDonationDialog />
      <DeliverDonationDialog />
    </div>
  );
}
