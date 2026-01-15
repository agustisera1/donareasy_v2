import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt: string;
  height?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

export function ImagePreview({
  src,
  alt,
  height = "h-64",
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ImagePreviewProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-md overflow-hidden border",
        height,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-contain", imageClassName)}
        sizes={sizes}
      />
    </div>
  );
}
