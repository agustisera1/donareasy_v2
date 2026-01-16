"use client";

import { deliveryMethodTranslations } from "@/lib/constants";

type DeliveryMethod = "pickup" | "shipment" | "agreement";

interface DeliveryMethodBadgeProps {
  deliveryMethod: DeliveryMethod;
}

export function DeliveryMethodBadge({
  deliveryMethod,
}: DeliveryMethodBadgeProps) {
  const deliveryMethodColors: Record<DeliveryMethod, string> = {
    pickup:
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    shipment:
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    agreement:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${deliveryMethodColors[deliveryMethod]}`}
    >
      {deliveryMethodTranslations[deliveryMethod].label}
    </div>
  );
}
