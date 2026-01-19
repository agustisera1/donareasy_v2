"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonHeroPaths = ['forgot-password', 'error', 'sign-up-success', 'update-password']
  const pathname = usePathname();
  const [, , page] = pathname.split("/")
  const withHero = !nonHeroPaths.includes(page)

  return (
    <div className={cn("flex min-h-svh w-full items-center p-6 md:p-10", withHero ? "justify-between" : "justify-center")}>
      {withHero && <div>Page hero here</div>}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
