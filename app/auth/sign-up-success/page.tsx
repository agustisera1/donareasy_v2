import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fragment } from "react/jsx-runtime";

export default function Page() {
  return (
    <Fragment>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Gracias por registrarte!
            </CardTitle>
            <CardDescription>
              Revisa tu email para confirmar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un email para confirmar tu cuenta. Por favor,
              revisa tu email y haz click en el enlace para confirmar tu
              cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
