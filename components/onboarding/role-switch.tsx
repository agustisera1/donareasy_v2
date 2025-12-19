"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface RoleSwitchProps {
  role: "donor" | "institution";
  onRoleChange: (role: "donor" | "institution") => void;
}

export function RoleSwitch({ role, onRoleChange }: RoleSwitchProps) {
  return (
    <div className="flex items-center space-x-2 p-4 border rounded-lg">
      <Label htmlFor="role-switch" className="text-sm font-medium">
        Donante
      </Label>
      <Switch
        id="role-switch"
        checked={role === "institution"}
        onCheckedChange={(checked) =>
          onRoleChange(checked ? "institution" : "donor")
        }
      />
      <Label htmlFor="role-switch" className="text-sm font-medium">
        Institución
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Información importante sobre instituciones"
          >
            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-xs">
            <b>Importante:</b> Las cuentas del tipo institución no pueden ser
            donantes en simultáneo, además deben ser revisadas por un
            administrador. Te notificaremos cuando tu cuenta esté aprobada y
            lista para recibir donaciones.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
