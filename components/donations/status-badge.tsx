"use client";

type DonationStatus = "accepted" | "rejected" | "pending" | "delivered";

interface StatusBadgeProps {
  status: DonationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusLabels: Record<DonationStatus, string> = {
    accepted: "Aceptada",
    rejected: "Rechazada",
    pending: "Pendiente",
    delivered: "Entregada",
  };

  const statusColors: Record<DonationStatus, string> = {
    accepted:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </div>
  );
}
