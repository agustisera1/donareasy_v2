"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstitutionsContext } from "@/contexts/institutions-context";
import { useInstitutionMetrics } from "@/hooks/use-institution-metrics";
import {
  deliveryMethodTranslations,
  categoryTranslations,
} from "@/lib/constants";
import { calculatePercentage, formatCurrency } from "@/lib/utils";

export function InstitutionMetricsDrawer() {
  const { metricsDrawerOpen, closeMetricsDrawer, selectedInstitution } =
    useInstitutionsContext();

  const { metrics, loading, error } = useInstitutionMetrics({
    institutionId: selectedInstitution?.id ?? null,
    enabled: metricsDrawerOpen && !!selectedInstitution,
  });

  if (!selectedInstitution) {
    return null;
  }

  return (
    <Drawer
      direction="right"
      open={metricsDrawerOpen}
      onOpenChange={closeMetricsDrawer}
    >
      <DrawerContent className="max-w-2xl">
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Métricas de {selectedInstitution.name}</DrawerTitle>
          <DrawerDescription>
            Información detallada sobre las donaciones de la institución
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">
                Error al cargar las métricas: {error.message}
              </p>
            </div>
          ) : metrics ? (
            <>
              {/* Métricas de Estado */}
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>Estado de Donaciones</CardTitle>
                  <CardDescription>
                    Distribución de donaciones por estado
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 space-x-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.status.total.percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.status.total.count}
                      </div>
                    </div>
                    <div className="space-y-1 space-x-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pendientes</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.status.pending.percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.status.pending.count}
                      </div>
                    </div>
                    <div className="space-y-1 space-x-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Aceptadas</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.status.accepted.percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.status.accepted.count}
                      </div>
                    </div>
                    <div className="space-y-1 space-x-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Rechazadas</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.status.rejected.percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.status.rejected.count}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Método de Entrega */}
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>Métodos de Entrega</CardTitle>
                  <CardDescription>
                    Distribución por método de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="space-y-4">
                    {Object.entries(metrics.categories.delivery).map(
                      ([method, count]) => {
                        const total = metrics.status.total.count;
                        const percentage = calculatePercentage(count, total);
                        const translation =
                          deliveryMethodTranslations[
                          method as keyof typeof deliveryMethodTranslations
                          ];

                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {translation.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {percentage}%
                                </span>
                                <span className="text-sm font-semibold">
                                  {count}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Categorías */}
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>Categorías de Donaciones</CardTitle>
                  <CardDescription>
                    Distribución por categoría de donación
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="space-y-4">
                    {Object.entries(metrics.categories.category).map(
                      ([category, count]) => {
                        const total = metrics.status.total.count;
                        const percentage = calculatePercentage(count, total);
                        const translation =
                          categoryTranslations[
                          category as keyof typeof categoryTranslations
                          ];

                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {translation.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {percentage}%
                                </span>
                                <span className="text-sm font-semibold">
                                  {count}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Total Recaudado */}
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>Total Recaudado</CardTitle>
                  <CardDescription>
                    Suma de donaciones monetarias aceptadas, entregadas y
                    rechazadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {formatCurrency(metrics.totalRaised)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Donaciones monetarias procesadas
                      </p>
                    </div>

                    {/* Subtotales */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Entregadas</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(metrics.raisedByStatus.delivered)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Aceptadas</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(metrics.raisedByStatus.accepted)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Rechazadas</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(metrics.raisedByStatus.rejected)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-1/2 mx-auto" onClick={closeMetricsDrawer}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
