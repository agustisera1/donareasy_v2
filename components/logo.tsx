import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 28, height = 28 }: LogoProps) {
  return (
    <Image
      src="/logo_terracota.svg"
      alt="Donareasy Logo"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  );
}
