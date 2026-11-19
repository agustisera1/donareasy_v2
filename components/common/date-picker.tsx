"use client";

import { useState } from "react";
import { format, isAfter, isBefore, isSameDay, parse, startOfToday } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { dateMatchModifiers, type Matcher } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";

const VALUE_FORMAT = "yyyy-MM-dd";

// Matcher, no fecha: "hoy" se lee al abrir el calendario, no en el prerender (Next: blocking-prerender-current-time).
export const isPastDay = (date: Date) => isBefore(date, startOfToday());
export const isFutureDay = (date: Date) => isAfter(date, startOfToday());

interface DatePickerProps {
  id?: string;
  /** Fecha en formato `yyyy-MM-dd`; vacío = sin fecha. */
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: Matcher | Matcher[];
  /** `dropdown` para fechas lejanas (p. ej. fundación): elige mes y año sin paginar. */
  captionLayout?: "label" | "dropdown";
  "aria-invalid"?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Seleccionar fecha",
  disabled = false,
  disabledDays,
  captionLayout = "label",
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  // Popover controlado para cerrarlo al elegir: ejemplo "Date of Birth" del Date Picker de shadcn.
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, VALUE_FORMAT, new Date(0)) : undefined;

  // El día ya elegido nunca queda deshabilitado, así se puede ver y quitar una fecha vieja.
  const isDisabled = (date: Date) =>
    !(selected && isSameDay(date, selected)) &&
    !!disabledDays &&
    dateMatchModifiers(date, disabledDays);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onBlur?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          captionLayout={captionLayout}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? format(date, VALUE_FORMAT) : "");
            handleOpenChange(false);
          }}
          disabled={isDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}
