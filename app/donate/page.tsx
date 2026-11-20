import { Suspense } from "react";
import type { Metadata } from "next";

import { GuestAccessForm } from "@/components/guest/guest-access-form";

export const metadata: Metadata = { title: "Donar sin registrarse | Donareasy" };

type PageProps = { searchParams: Promise<{ expired?: string }> };

export default function DonatePage({ searchParams }: PageProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Quiero donar</h1>
        <p className="text-muted-foreground">
          Completá tus datos y te enviamos un enlace a tu correo para que puedas hacer tu donación. El
          enlace vence en 30 minutos.
        </p>
      </div>
      <Suspense>
        <ExpiredNotice searchParams={searchParams} />
      </Suspense>
      <GuestAccessForm />
    </div>
  );
}

async function ExpiredNotice({ searchParams }: PageProps) {
  const { expired } = await searchParams;
  if (expired !== "1") return null;
  return (
    <p role="status" className="mb-6 rounded-lg border bg-muted/40 p-4 text-sm">
      Tu enlace venció. Pedí uno nuevo con el formulario.
    </p>
  );
}
