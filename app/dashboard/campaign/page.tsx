"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CreateCampaignDrawer } from "@/components/campaigns/create-campaign-drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { InstitutionData } from "@/app/api/user/route";

export default function CampaignPage() {
  const { user, loading: loadingUser } = useUser();
  const options =
    user?.role === "institution" ? undefined : { userId: user?.user_id };
  const { campaigns, loading, refetch } = useCampaigns(options);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isInstitution = user?.role === "institution";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loadingUser || loading) {
    return (
      <div className="w-full max-w-5xl p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campañas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las campañas de donación
          </p>
        </div>
        {isInstitution && (
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        )}
      </div>

      <CreateCampaignDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        institution={isInstitution ? (user as InstitutionData) : null}
        onSuccess={refetch}
      />

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No hay campañas disponibles
            </p>
            {isInstitution && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear primera campaña
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{campaign.type}</CardTitle>
                    <CardDescription className="mt-1">
                      Iniciada el {formatDate(campaign.start_date)}
                    </CardDescription>
                  </div>
                  {campaign.termination_date && (
                    <span className="text-sm text-muted-foreground">
                      Finaliza: {formatDate(campaign.termination_date)}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  {campaign.description}
                </p>
                {campaign.quantity && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Cantidad:</strong> {campaign.quantity}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
