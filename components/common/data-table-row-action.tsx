"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DataTableRowActionProps = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
} & ({ onClick: () => void; href?: never } | { href: string; onClick?: never });

export function DataTableRowAction({
  label,
  icon,
  onClick,
  href,
  disabled = false,
}: DataTableRowActionProps) {
  const content = (
    <>
      {icon}
      <span className="sr-only">{label}</span>
    </>
  );
  const button =
    href && !disabled ? (
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href={href}>{content}</Link>
      </Button>
    ) : (
      <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled}>
        {content}
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
