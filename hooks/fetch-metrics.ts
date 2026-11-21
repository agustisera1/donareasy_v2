import type { ServiceResult } from "@/lib/shared/result";
import type { DonationMetrics } from "@/lib/types";

// TanStack Query trata como error lo que el queryFn rechaza: el `ServiceResult` fallido se convierte en throw.
export async function fetchMetrics(url: string): Promise<DonationMetrics> {
  const response = await fetch(url);
  const result: ServiceResult<DonationMetrics> = await response.json();
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
