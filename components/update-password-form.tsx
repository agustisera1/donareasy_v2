"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations";
import { PasswordInput } from "@/components/common/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", repeatPassword: "" },
  });

  async function onSubmit({ password }: UpdatePasswordInput) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setError("root", { message: authErrorMessage(error) });

    toast.success("Contraseña actualizada");
    router.push("/dashboard");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cambiar contraseña</CardTitle>
          <CardDescription>Ingresá tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field data-invalid={!!errors.repeatPassword}>
                <FieldLabel htmlFor="repeat-password">Repetir contraseña</FieldLabel>
                <PasswordInput
                  id="repeat-password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.repeatPassword}
                  {...register("repeatPassword")}
                />
                <FieldError errors={[errors.repeatPassword]} />
              </Field>
              <FieldError errors={[errors.root]} />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
