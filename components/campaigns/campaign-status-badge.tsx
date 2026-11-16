import { Badge } from "@/components/ui/badge";

export function CampaignStatusBadge({ finished }: { finished: boolean }) {
  return finished ? (
    <Badge variant="secondary">Finalizada</Badge>
  ) : (
    <Badge className="bg-success/15 text-success dark:bg-success/20">Activa</Badge>
  );
}
