"use client";

import type { ComponentProps, MouseEvent } from "react";

// Link a otro estado de la misma vista (página, orden): cambia la URL con la History API, sin pedirle
// nada al server. Ref: node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md
export function HistoryLink({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    window.history.pushState(null, "", href);
  }

  return <a href={href} onClick={handleClick} {...props} />;
}
