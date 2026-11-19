import { Clock } from "lucide-react";

export function PendingApproval() {
  return (
    <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Clock className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-bold">Tu cuenta está en revisión</h1>
      <p className="text-muted-foreground">
        Tu cuenta institucional está en revisión. Te vamos a avisar cuando esté
        aprobada y puedas usarla.
      </p>
    </div>
  );
}
