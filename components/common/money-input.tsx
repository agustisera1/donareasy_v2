"use client";

import type { ComponentProps } from "react";

import { MaskInput } from "@/components/ui/mask-input";

type MoneyInputProps = Omit<
  ComponentProps<typeof MaskInput>,
  "mask" | "currency" | "locale" | "value" | "onValueChange"
> & {
  /** Monto sin máscara (`"1234.56"`), listo para `Number()`. */
  value: string;
  onValueChange: (value: string) => void;
};

// Monto en ARS con la máscara `currency` de Dice UI Mask Input (Intl, es-AR).
export function MoneyInput({ value, onValueChange, ...props }: MoneyInputProps) {
  return (
    <MaskInput
      mask="currency"
      currency="ARS"
      locale="es-AR"
      value={value}
      onValueChange={(_masked, unmasked) => onValueChange(unmasked)}
      {...props}
    />
  );
}
