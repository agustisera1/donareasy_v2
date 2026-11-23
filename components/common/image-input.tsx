"use client";

import { useState, type ReactNode } from "react";
import { Eraser, ImagePlus } from "lucide-react";

import { ImagePreview } from "@/components/common/image-preview";
import { Button } from "@/components/ui/button";

interface ImageInputProps {
  id: string;
  label: string;
  accept: string;
  hint?: string;
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
  invalid?: boolean;
  /** Ubica las acciones (Quitar / Reemplazar) fuera del bloque, p. ej. en el header de una card. */
  layout?: (parts: { body: ReactNode; actions: ReactNode }) => ReactNode;
}

export function ImageInput({
  id,
  label,
  accept,
  hint,
  file,
  currentUrl = null,
  onChange,
  invalid = false,
  layout = defaultLayout,
}: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // El object URL se crea y se libera en los handlers: es la única forma de ver el archivo local.
  function select(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(next ? URL.createObjectURL(next) : null);
    onChange(next);
  }

  const shown = preview ?? (file ? null : currentUrl);

  const input = (
    <input
      id={id}
      type="file"
      className="sr-only"
      accept={accept}
      aria-invalid={invalid}
      onChange={(event) => {
        select(event.target.files?.[0] ?? null);
        event.target.value = "";
      }}
    />
  );

  if (!shown)
    return layout({
      actions: null,
      body: (
        <label
          htmlFor={id}
          className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-4 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive"
        >
          {input}
          <ImagePlus className="size-8" />
          <span className="text-sm font-medium text-foreground">Subí una imagen</span>
          {hint && <span className="text-xs">{hint}</span>}
        </label>
      ),
    });

  return layout({
    body: (
      <>
        {input}
        <ImagePreview src={shown} alt={label} />
      </>
    ),
    actions: (
      <div className="flex gap-2">
        {file && (
          <Button type="button" variant="outline" size="sm" onClick={() => select(null)}>
            <Eraser />
            Quitar
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" asChild>
          <label htmlFor={id} className="cursor-pointer">
            <ImagePlus />
            Reemplazar
          </label>
        </Button>
      </div>
    ),
  });
}

function defaultLayout({ body, actions }: { body: ReactNode; actions: ReactNode }) {
  return (
    <div className="space-y-2">
      {body}
      {actions && <div className="flex justify-end">{actions}</div>}
    </div>
  );
}
