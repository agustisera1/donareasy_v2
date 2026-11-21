"use client";

import type { ComponentProps, ReactNode } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  label: string;
  children: ReactNode;
  side?: ComponentProps<typeof TooltipContent>["side"];
  className?: string;
}

export function InfoTooltip({ label, children, side, className }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs">
          <Info className="text-tertiary" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side} className={cn("max-w-sm", className)}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

interface InfoTooltipListProps {
  items: { label: string; description: string }[];
}

export function InfoTooltipList({ items }: InfoTooltipListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-sm font-semibold">{item.label}</p>
          <p className="text-xs text-tooltip-foreground/70">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
