"use client";

import { usePathname } from "next/navigation";

function getHeaderContent(pathname: string) {
  switch (pathname) {
    case "/dashboard/donations":
      return ["Donaciones", "Las donaciones son aportes de dinero o bienes que hacés a una institución, directamente o a través de una campaña. Podés ver en qué estado está cada una (pendiente, aceptada o rechazada) y su detalle."];
    case "/dashboard/campaigns":
      return ["Campañas", "Las campañas son anuncios abiertos que hacen las instituciones para recibir donaciones particulares, por ejemplo campañas alimenticias o colectas de dinero hospitalarias. Podés ver el estado actual de cada campaña en su detalle y sus métricas."];
    case "/dashboard/institutions":
      return ["Instituciones", "Las instituciones son las organizaciones que reciben donaciones, como comedores, hogares u hospitales. Podés ver el perfil de cada una y sus datos de contacto."];
    case "/dashboard/metrics":
      return ["Métricas", "Resumen de las donaciones que recibe tu institución"];
    default:
      return ["", ""];
  }
}

export default function Header() {
  const pathname = usePathname();
  const [header, subheader] = getHeaderContent(pathname);

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 border-l border-l-foreground/10 sticky top-0 z-10 bg-background py-4">
      <div className="w-full max-w-6xl px-6">
        <h1 className="text-3xl font-bold">{header}</h1>
        <p className="max-w-3/4 text-muted-foreground">
          {subheader}
        </p>
      </div>
    </nav>
  )
}