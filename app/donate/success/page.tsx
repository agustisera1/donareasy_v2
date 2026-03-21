import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Donación enviada | Donareasy",
};

export default function DonateSuccessPage() {
  return (
    <div className="w-full max-w-md text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">¡Gracias por tu donación!</h1>
        <p className="text-muted-foreground">
          Tu donación fue registrada correctamente. La institución va a
          revisar los detalles y se va a poner en contacto con vos para
          coordinar.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        ¿Querés hacer seguimiento de tus donaciones y acceder a más
        funcionalidades?
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/auth/sign-up">Crear una cuenta</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/donate">Realizar otra donación</Link>
        </Button>
      </div>
    </div>
  );
}
