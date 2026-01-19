"use client";

import { Mail, Instagram } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { DocumentationButton } from "@/components/documentation-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ICON_SIZE = 16;

export function Footer() {
  return (
    <footer className="w-full flex items-center justify-start border-t mx-auto text-center text-xs gap-8 py-4 px-6">
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <DocumentationButton />
        <Button
          variant="ghost"
          size="sm"
          asChild
          aria-label="Contactar por email"
          title="Contactar por email"
        >
          <Link href="mailto:donareasy@gmail.com">
            <Mail size={ICON_SIZE} className="text-muted-foreground" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          aria-label="Seguir en Instagram"
          title="Seguir en Instagram"
        >
          <Link
            href="https://instagram.com/donareasy"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={ICON_SIZE} className="text-muted-foreground" />
          </Link>
        </Button>
      </div>
    </footer>
  );
}
