"use client";

import { useState } from "react";
import { DonorForm } from "@/components/onboarding/donor-form";
import { InstitutionForm } from "@/components/onboarding/institution-form";
import { RoleSwitch } from "@/components/onboarding/role-switch";

export default function OnboardingPage() {
  const [role, setRole] = useState<"donor" | "institution">("donor");

  return (
    <div className="w-full max-w-5xl p-6 space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-bold">Completa tu Perfil</h1>
        <p className="text-muted-foreground w-1/2 text-center">
          Seleccioná tu tipo de cuenta y completa la información.
        </p>

        <RoleSwitch role={role} onRoleChange={setRole} />
      </div>

      <div className="flex justify-center">
        {role === "donor" ? <DonorForm /> : <InstitutionForm />}
      </div>
    </div>
  );
}
