"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 28, height = 28 }: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the actual theme (considering system theme)
  const actualTheme =
    theme === "system" ? systemTheme : theme;

  // Select logo based on theme
  const logoSrc =
    actualTheme === "dark" ? "/logo_blanco.png" : "/logo_negro.png";

  // Show a placeholder or default logo while mounting to avoid hydration mismatch
  if (!mounted) {
    return (
      <Image
        src="/logo_negro.png"
        alt="Donareasy Logo"
        width={width}
        height={height}
        className={cn("object-contain", className)}
        priority
      />
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="Donareasy Logo"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  );
}
