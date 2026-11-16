import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export function useSearchParamsState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const replace = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return { searchParams, replace };
}

export function parseSorting(raw: string | null): SortingState {
  if (!raw) return [];
  return raw.split(",").flatMap((entry) => {
    const [id, direction] = entry.split(".");
    return id ? [{ id, desc: direction === "desc" }] : [];
  });
}

export function serializeSorting(sorting: SortingState): string {
  return sorting.map(({ id, desc }) => `${id}.${desc ? "desc" : "asc"}`).join(",");
}

export function parseColumnFilters(
  searchParams: URLSearchParams,
  columnIds: string[]
): ColumnFiltersState {
  return columnIds.flatMap((id) => {
    const raw = searchParams.get(id);
    return raw ? [{ id, value: raw.split(",") }] : [];
  });
}

export function writeColumnFilters(
  params: URLSearchParams,
  columnIds: string[],
  filters: ColumnFiltersState
) {
  for (const id of columnIds) {
    const value = filters.find((filter) => filter.id === id)?.value;
    if (Array.isArray(value) && value.length) params.set(id, value.join(","));
    else params.delete(id);
  }
}
