import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  /** `sm` para datos de texto (nombres, fechas); `default` para KPIs numéricos. */
  size?: "default" | "sm";
}

export function StatCard({ label, value, hint, size = "default" }: StatCardProps) {
  return (
    <Card className="gap-3 py-3 [--card-spacing:--spacing(3)]">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("tabular-nums", size === "sm" ? "text-base" : "text-2xl")}>{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}
