import type { Row } from "@tanstack/react-table";

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Sin distinguir mayúsculas ni tildes: "maria" encuentra "María".
export function matchesSearch<TData>(row: Row<TData>, columnId: string, query: string) {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  return normalizeSearch(String(row.getValue(columnId) ?? "")).includes(needle);
}
