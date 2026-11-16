"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableRowActionProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function DataTableRowAction({
  label,
  icon,
  onClick,
  disabled = false,
}: DataTableRowActionProps) {
  const button = (
    <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled}>
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Radix: un botón disabled no emite eventos, el span recibe hover y foco. */}
        {disabled ? <span tabIndex={0}>{button}</span> : button}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
