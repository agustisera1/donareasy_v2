import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Algo salió mal | Donareasy" };

const REASONS: Record<string, string> = {
  link_invalid:
    "El link venció, ya se usó o se abrió en otro navegador. Iniciá sesión con tu email y contraseña: tu cuenta ya puede estar confirmada.",
  missing_code: "El link está incompleto. Volvé a abrirlo desde el mail.",
};

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <p className="text-sm text-muted-foreground">
      {(reason && REASONS[reason]) ?? "Ocurrió un error inesperado."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Algo salió mal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Suspense>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>
        <Button asChild className="w-full">
          <Link href="/auth/login">Ir a iniciar sesión</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
