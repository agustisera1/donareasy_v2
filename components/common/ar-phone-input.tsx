"use client";

import type { ComponentProps } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { PhoneInput } from "@/components/reui/phone-input";

type ArPhoneInputProps = Omit<
  ComponentProps<typeof PhoneInput>,
  "value" | "onChange" | "countries" | "defaultCountry"
> & {
  /** Número en E.164 (`+5493511234567`); acepta un número local guardado antes de la máscara. */
  value: string;
  onChange: (value: string) => void;
};

// Teléfono de Argentina con ReUI Phone Input (react-phone-number-input / libphonenumber).
export function ArPhoneInput({ value, onChange, ...props }: ArPhoneInputProps) {
  return (
    <PhoneInput
      countries={["AR"]}
      defaultCountry="AR"
      value={toE164(value)}
      onChange={(next) => onChange(next ?? "")}
      {...props}
    />
  );
}

function toE164(value: string) {
  if (!value) return "";
  return parsePhoneNumberFromString(value, "AR")?.number ?? "";
}
