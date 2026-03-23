"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";

function getHeaderContent(pathname: string) {
  switch (pathname) {
    case "/dashboard/donations":
      return ["Donaciones", "Visualiza y gestiona las donaciones"];
    case "/dashboard/campaign":
      return ["Campañas", "Visualiza y gestiona las campañas"];
    case "/dashboard/institutions":
      return ["Instituciones", "Visualiza el listado de instituciones"];
    default:
      return ["", ""];
  }
}

export default function Header() {
  const pathname = usePathname();
  const [header, subheader] = getHeaderContent(pathname);

  return (
    <nav className="w-full flex items-center justify-between border-b border-b-foreground/10 border-l border-l-foreground/10 sticky top-0 z-10 bg-background py-4 px-20">
      <div>
        <h1 className="text-3xl font-bold">{header}</h1>
        <p className="text-muted-foreground">{subheader}</p>
      </div>
      <NotificationBell />
    </nav>
  );
}