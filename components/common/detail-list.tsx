import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailList({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
      {children}
    </dl>
  );
}

interface DetailItemProps {
  label: ReactNode;
  children: ReactNode;
  /** Valor debajo de la etiqueta y a todo el ancho (textos largos, imágenes). */
  stacked?: boolean;
}

export function DetailItem({ label, children, stacked = false }: DetailItemProps) {
  return (
    <div className="contents">
      <dt className={cn("font-medium", stacked && "col-span-2")}>{label}</dt>
      <dd className={cn("min-w-0 break-words", stacked && "col-span-2")}>
        {children}
      </dd>
    </div>
  );
}
