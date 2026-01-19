"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";

export function Hero() {
  const pathname = usePathname();
  const isSignUpPage = pathname === "/auth/sign-up";
  const isLoginPage = pathname === "/auth/login";

  return (
    <div className="hidden lg:flex flex-col justify-center items-start max-w-lg">
      <div className="flex items-center gap-3">
        <Logo width={120} height={120} />
        <h1 className="text-5xl font-bold tracking-tight">
          ¡Bienvenido a Donareasy!
        </h1>
      </div>

      <div className="flex flex-col ml-[132px]">
        <p className="text-lg font-bold text-muted-foreground leading-tight">
          Colaborá con quienes lo necesitan, en el momento oportuno
        </p>

        <p className="text-sm font-semibold text-muted-foreground leading-tight mt-4">
          Toda contribución suma, por pequeña o grande que sea.
        </p>

        <div className="flex flex-col gap-2 w-full">
          {isSignUpPage && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground leading-tight">
                Ya estás registrado?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline underline-offset-4 font-medium underline"
                >
                  Iniciá sesión
                </Link>
              </p>
            </div>
          )}

          {isLoginPage && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground leading-tight">
                No estás registrado?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary hover:underline underline-offset-4 font-medium underline"
                >
                  Creá tu cuenta
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
