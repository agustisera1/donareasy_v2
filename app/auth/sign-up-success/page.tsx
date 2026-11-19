import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Revisá tu email | Donareasy" };

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">¡Gracias por registrarte!</CardTitle>
        <CardDescription>Revisá tu email para confirmar tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Te enviamos un link de confirmación. Abrilo en este mismo navegador para entrar directo a
          completar tu perfil.
        </p>
      </CardContent>
    </Card>
  );
}
