import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculatePercentage } from "@/lib/utils";

export type BreakdownItem = { key: string; label: string; count: number };

interface BreakdownListProps {
  title: string;
  description?: string;
  items: BreakdownItem[];
  total: number;
}

export function BreakdownList({ title, description, items, total }: BreakdownListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => {
            const percentage = calculatePercentage(item.count, total, 0);
            return (
              <li key={item.key} className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count} · {percentage}%
                  </span>
                </div>
                <Progress value={percentage} aria-label={`${item.label}: ${percentage}%`} />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function toBreakdownItems<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
): BreakdownItem[] {
  return (Object.keys(labels) as K[]).map((key) => ({ key, label: labels[key], count: counts[key] }));
}
