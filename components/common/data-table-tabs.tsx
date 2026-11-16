"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParamsState } from "@/components/common/use-search-params-state";

interface DataTableTabsProps<TValue extends string> {
  param: string;
  options: readonly { value: TValue; label: string }[];
  value: TValue;
}

export function DataTableTabs<TValue extends string>({
  param,
  options,
  value,
}: DataTableTabsProps<TValue>) {
  const { replace } = useSearchParamsState();

  const onValueChange = (next: string) =>
    replace((params) =>
      next === options[0].value ? params.delete(param) : params.set(param, next)
    );

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="gap-1 group-data-horizontal/tabs:h-9">
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value} className="px-3 data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function parseTab<TValue extends string>(
  raw: string | null,
  options: readonly { value: TValue }[]
): TValue {
  return options.find((option) => option.value === raw)?.value ?? options[0].value;
}
