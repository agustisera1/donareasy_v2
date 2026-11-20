import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { GuestDonationForm } from "@/components/donations/guest-donation-form";
import { getGuestToken } from "@/queries/guest/get-guest-token";
import { listGuestInstitutions } from "@/queries/guest/list-guest-institutions";

export const metadata: Metadata = { title: "Donar | Donareasy" };

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function GuestDonationPage({ params }: PageProps) {
  const { token } = await params;
  const guest = await getGuestToken(token);

  if (guest.ok && guest.data.state === "expired") redirect("/donate?expired=1");
  if (!guest.ok || guest.data.state === "used") {
    const used = guest.ok;
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">{used ? "Enlace ya utilizado" : "Enlace inválido"}</h1>
        <p className="text-muted-foreground">
          {used
            ? "Este enlace ya se usó para hacer una donación."
            : "Este enlace no existe o ya no es válido."}
        </p>
        <Button asChild>
          <Link href="/donate">Pedir un nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  const institutions = await listGuestInstitutions(token);

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">¡Hola, {guest.data.name}!</h1>
        <p className="text-muted-foreground">
          Completá los datos de tu donación. La institución se va a poner en contacto con vos para
          coordinar.
        </p>
      </div>
      <GuestDonationForm token={token} institutions={institutions.ok ? institutions.data : []} />
    </div>
  );
}
