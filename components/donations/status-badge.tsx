import { Badge } from "@/components/ui/badge";

type DonationStatus = "accepted" | "rejected" | "pending" | "delivered";

const statusLabels: Record<DonationStatus, string> = {
  accepted: "Aceptada",
  rejected: "Rechazada",
  pending: "Pendiente",
  delivered: "Entregada",
};

const statusTones: Record<DonationStatus, string> = {
  accepted: "bg-success/15 text-success dark:bg-success/20",
  rejected: "bg-destructive/15 text-destructive dark:bg-destructive/20",
  pending: "bg-warning/15 text-warning dark:bg-warning/20",
  delivered: "bg-info/15 text-info dark:bg-info/20",
};

export function StatusBadge({ status }: { status: DonationStatus }) {
  return <Badge className={statusTones[status]}>{statusLabels[status]}</Badge>;
}
