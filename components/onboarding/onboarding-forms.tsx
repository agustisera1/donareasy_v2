"use client";

import { useState } from "react";
import { DonorForm } from "@/components/onboarding/donor-form";
import { InstitutionForm } from "@/components/onboarding/institution-form";
import { RoleSwitch } from "@/components/onboarding/role-switch";
import type { RoleName } from "@/lib/types";

export function OnboardingForms() {
  const [role, setRole] = useState<RoleName>("donor");

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-bold">Completá tu perfil</h1>
        <p className="max-w-md text-center text-muted-foreground">
          Seleccioná tu tipo de cuenta y completá la información.
        </p>

        <RoleSwitch role={role} onRoleChange={setRole} />
      </div>

      <div className="flex justify-center">
        {role === "donor" ? <DonorForm /> : <InstitutionForm />}
      </div>
    </div>
  );
}
