import { createClient } from "@/lib/supabase/server";
import { GuestDonationForm } from "@/components/guest/guest-donation-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function GuestDonationPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: tokenRow } = await supabase
    .from("guest_tokens")
    .select("name, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Enlace inválido</h1>
        <p className="text-muted-foreground">
          Este enlace no existe o ya no es válido.
        </p>
        <Button asChild>
          <Link href="/donate">Solicitar un nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  if (tokenRow.used_at) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Enlace ya utilizado</h1>
        <p className="text-muted-foreground">
          Este enlace ya fue usado para realizar una donación.
        </p>
        <Button asChild>
          <Link href="/donate">Solicitar un nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Hola, {tokenRow.name}!</h1>
        <p className="text-muted-foreground">
          Completá los datos de tu donación. La institución se va a poner en
          contacto con vos para coordinar.
        </p>
      </div>
      <GuestDonationForm token={token} institutions={institutions ?? []} />
    </div>
  );
}
