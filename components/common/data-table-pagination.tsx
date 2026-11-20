"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HistoryLink } from "@/components/common/history-link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

function visiblePages(current: number, total: number): (number | "ellipsis")[] {
  const pages = new Set([1, current - 1, current, current + 1, total]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, i) =>
    i > 0 && page - sorted[i - 1] > 1 ? (["ellipsis", page] as const) : [page]
  );
}

interface DataTablePaginationProps {
  current: number;
  pageCount: number;
}

export function DataTablePagination({ current, pageCount }: DataTablePaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {current > 1 ? (
            <Button asChild variant="ghost" size="icon">
              <HistoryLink href={hrefFor(current - 1)}>
                <ChevronLeftIcon />
                <span className="sr-only">Ir a la página anterior</span>
              </HistoryLink>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeftIcon />
              <span className="sr-only">Ir a la página anterior</span>
            </Button>
          )}
        </PaginationItem>
        {visiblePages(current, pageCount).map((page, i) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Button
                asChild
                variant={page === current ? "default" : "ghost"}
                size="icon"
              >
                <HistoryLink
                  href={hrefFor(page)}
                  aria-current={page === current ? "page" : undefined}
                  className="tabular-nums"
                >
                  {page}
                </HistoryLink>
              </Button>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          {current < pageCount ? (
            <Button asChild variant="ghost" size="icon">
              <HistoryLink href={hrefFor(current + 1)}>
                <ChevronRightIcon />
                <span className="sr-only">Ir a la página siguiente</span>
              </HistoryLink>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" disabled>
              <ChevronRightIcon />
              <span className="sr-only">Ir a la página siguiente</span>
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
