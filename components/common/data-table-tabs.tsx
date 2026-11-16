"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onValueChange = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === options[0].value) params.delete(param);
    else params.set(param, next);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

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
