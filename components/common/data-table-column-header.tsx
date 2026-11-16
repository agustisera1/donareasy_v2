"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  if (!column.getCanSort()) return title;

  return (
    <Button
      variant="ghost"
      className="-ml-2.5"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "desc" ? (
        <ArrowDownIcon data-icon="inline-end" />
      ) : sorted === "asc" ? (
        <ArrowUpIcon data-icon="inline-end" />
      ) : (
        <ChevronsUpDownIcon data-icon="inline-end" className="text-muted-foreground" />
      )}
    </Button>
  );
}
