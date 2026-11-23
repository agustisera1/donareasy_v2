"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ZOOM_STEPS = [1, 1.5, 2, 3];

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative block h-64 w-full cursor-zoom-in overflow-hidden rounded-md border transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50",
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
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <ImageViewer src={src} alt={alt} />
      </DialogContent>
    </Dialog>
  );
}

// Se monta solo con el Dialog abierto: el zoom vuelve a 100% al cerrarlo.
function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [step, setStep] = useState(0);
  const zoom = ZOOM_STEPS[step];

  return (
    <>
      <div className="flex items-center justify-between gap-2 pr-8">
        <DialogTitle className="truncate">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Visor de imagen con zoom</DialogDescription>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Alejar"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ZoomOut />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Acercar"
            disabled={step === ZOOM_STEPS.length - 1}
            onClick={() => setStep(step + 1)}
          >
            <ZoomIn />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Restablecer zoom"
            disabled={step === 0}
            onClick={() => setStep(0)}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>
      <div className="h-[70dvh] overflow-auto rounded-md border bg-muted/30">
        <div className="relative" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
          <Image src={src} alt={alt} fill unoptimized className="object-contain" />
        </div>
      </div>
    </>
  );
}
