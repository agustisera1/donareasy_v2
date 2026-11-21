"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/common/info-tooltip";
import type { RoleName } from "@/lib/types";

interface RoleSwitchProps {
  role: RoleName;
  onRoleChange: (role: RoleName) => void;
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
      <InfoTooltip label="Información importante sobre instituciones" side="right" className="max-w-xs">
        <p className="text-xs">
          <b>Importante:</b> Las cuentas del tipo institución no pueden ser
          donantes en simultáneo, además deben ser revisadas por un
          administrador. Te notificaremos cuando tu cuenta esté aprobada y
          lista para recibir donaciones.
        </p>
      </InfoTooltip>
    </div>
  );
}
