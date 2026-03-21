"use server";

import { createClient } from "@/lib/supabase/server";
import type { DeliveryMethod, DonationCategory } from "@/lib/types";

export type Metric = {
  count: number;
  percentage: number;
};

export type StatusMetrics = {
  total: Metric;
  pending: Metric;
  accepted: Metric;
  rejected: Metric;
};

export type CategoryMetrics = {
  delivery: Record<DeliveryMethod, number>;
  category: Record<DonationCategory, number>;
};

export interface InstitutionMetrics {
  status: StatusMetrics;
  categories: CategoryMetrics;
  totalRaised: number; // Total recaudado en donaciones monetarias (accepted, delivered, rejected)
  raisedByStatus: {
    accepted: number; // Total recaudado en donaciones aceptadas
    delivered: number; // Total recaudado en donaciones entregadas
    rejected: number; // Total recaudado en donaciones rechazadas
  };
}

export async function getInstitutionMetrics(institutionId: string): Promise<{
  success: boolean;
  data?: InstitutionMetrics;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Verificar que el usuario esté autenticado
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // Verificar que la institución existe
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id")
      .eq("id", institutionId)
      .maybeSingle();

    if (institutionError) {
      throw new Error(
        `Error verificando institución: ${institutionError.message}`
      );
    }

    if (!institution) {
      return {
        success: false,
        error: "Institución no encontrada",
      };
    }

    // Obtener todas las donaciones de la institución
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("status, amount, delivery_method, category")
      .eq("institution_id", institutionId);

    if (donationsError) {
      throw new Error(`Error obteniendo donaciones: ${donationsError.message}`);
    }

    // Inicializar contadores temporales
    let totalCount = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let totalRaised = 0; // Total recaudado en donaciones monetarias
    let raisedAccepted = 0; // Total recaudado en donaciones aceptadas
    let raisedDelivered = 0; // Total recaudado en donaciones entregadas
    let raisedRejected = 0; // Total recaudado en donaciones rechazadas

    const deliveryCounts: Record<DeliveryMethod, number> = {
      pickup: 0,
      shipment: 0,
      agreement: 0,
      transfer: 0,
    };

    const categoryCounts: Record<DonationCategory, number> = {
      supplies: 0,
      clothing: 0,
      food: 0,
      other: 0,
    };

    // Calcular contadores
    if (donations) {
      for (const donation of donations) {
        // Métricas de status (overall)
        totalCount++;
        if (donation.status === "pending") {
          pendingCount++;
        } else if (donation.status === "accepted") {
          acceptedCount++;
        } else if (donation.status === "rejected") {
          rejectedCount++;
        }

        // Calcular total recaudado: suma de donaciones monetarias (amount !== null)
        // con estados accepted, delivered o rejected
        if (donation.amount !== null) {
          const amount = Number(donation.amount);
          if (donation.status === "accepted") {
            totalRaised += amount;
            raisedAccepted += amount;
          } else if (donation.status === "delivered") {
            totalRaised += amount;
            raisedDelivered += amount;
          } else if (donation.status === "rejected") {
            totalRaised += amount;
            raisedRejected += amount;
          }
        }

        // Métricas de categorías - delivery_method
        if (donation.delivery_method === "pickup") {
          deliveryCounts.pickup++;
        } else if (donation.delivery_method === "shipment") {
          deliveryCounts.shipment++;
        } else if (donation.delivery_method === "agreement") {
          deliveryCounts.agreement++;
        }

        // Métricas de categorías - category
        if (donation.category === "supplies") {
          categoryCounts.supplies++;
        } else if (donation.category === "clothing") {
          categoryCounts.clothing++;
        } else if (donation.category === "food") {
          categoryCounts.food++;
        } else if (donation.category === "other") {
          categoryCounts.other++;
        }
      }
    }

    // Función helper para calcular porcentaje
    const calculatePercentage = (count: number, total: number): number => {
      if (total === 0) return 0;
      return Math.round((count / total) * 100 * 100) / 100; // Redondear a 2 decimales
    };

    // Construir métricas con porcentajes
    const metrics: InstitutionMetrics = {
      status: {
        total: {
          count: totalCount,
          percentage: 100, // El total siempre es 100%
        },
        pending: {
          count: pendingCount,
          percentage: calculatePercentage(pendingCount, totalCount),
        },
        accepted: {
          count: acceptedCount,
          percentage: calculatePercentage(acceptedCount, totalCount),
        },
        rejected: {
          count: rejectedCount,
          percentage: calculatePercentage(rejectedCount, totalCount),
        },
      },
      categories: {
        delivery: {
          pickup: deliveryCounts.pickup,
          shipment: deliveryCounts.shipment,
          agreement: deliveryCounts.agreement,
          transfer: deliveryCounts.transfer,
        },
        category: {
          supplies: categoryCounts.supplies,
          clothing: categoryCounts.clothing,
          food: categoryCounts.food,
          other: categoryCounts.other,
        },
      },
      totalRaised,
      raisedByStatus: {
        accepted: raisedAccepted,
        delivered: raisedDelivered,
        rejected: raisedRejected,
      },
    };

    return {
      success: true,
      data: metrics,
    };
  } catch (error) {
    console.error("Error in getInstitutionMetrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
