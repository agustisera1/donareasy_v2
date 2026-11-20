import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "relative block h-64 w-full cursor-zoom-in overflow-hidden rounded-md border transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="sr-only">Ver imagen completa: {alt}</span>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </a>
  );
}
