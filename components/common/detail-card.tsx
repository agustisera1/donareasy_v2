import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function DetailCard({ title, icon, action, children }: DetailCardProps) {
  return (
    <Card className="gap-3 py-3 [--card-spacing:--spacing(3)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}
