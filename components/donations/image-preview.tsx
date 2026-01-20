import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt: string;
  height?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  blur?: boolean;
}

export function ImagePreview({
  src,
  alt,
  height = "h-64",
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  blur = false,
}: ImagePreviewProps) {
  const handleClick = () => {
    window.open(src, "_blank");
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-md overflow-hidden border cursor-zoom-in transition-opacity hover:opacity-90",
        height,
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Ver imagen completa: ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-contain", imageClassName)}
        style={blur ? { filter: "blur(6px)" } : undefined}
        sizes={sizes}
      />
    </div>
  );
}
