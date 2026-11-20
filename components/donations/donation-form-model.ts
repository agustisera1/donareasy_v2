import type { Donation } from "@/lib/types";
import type { CreateDonationInput, DonationFormValues } from "@/lib/validations";

export type InstitutionOption = { id: string; name: string };

export const emptyDonationForm: DonationFormValues = {
  donationType: "goods",
  openDonation: false,
  institutionId: "",
  deliveryMethod: "pickup",
  category: "supplies",
  amount: "",
  name: "",
  description: "",
  attachment: null,
};

export function formValuesFromDonation(donation: Donation): DonationFormValues {
  return {
    donationType: donation.amount === null ? "goods" : "money",
    openDonation: donation.institution_id === null,
    institutionId: donation.institution_id ?? "",
    deliveryMethod: donation.delivery_method,
    category: donation.category,
    amount: donation.amount?.toString() ?? "",
    name: donation.name ?? "",
    description: donation.description ?? "",
    attachment: null,
  };
}

// Un monetario no lleva nombre ni descripción; uno de bienes no lleva monto.
export function toContentInput(values: DonationFormValues) {
  const isMoney = values.donationType === "money";
  return {
    deliveryMethod: values.deliveryMethod,
    category: values.category,
    name: isMoney ? null : values.name || null,
    description: isMoney ? null : values.description || null,
    amount: isMoney ? Number(values.amount) : null,
  } satisfies Omit<CreateDonationInput, "institutionId" | "campaignId" | "attachment">;
}

export const toInstitutionId = (values: DonationFormValues) =>
  values.openDonation ? null : values.institutionId || null;

export const donationTypeTabs = [
  { value: "all", label: "Todas" },
  { value: "money", label: "Monetarias" },
  { value: "goods", label: "Bienes" },
] as const;
export type DonationTypeTab = (typeof donationTypeTabs)[number]["value"];

export const parseDonationTypeTab = (raw: string | undefined): DonationTypeTab =>
  donationTypeTabs.find((tab) => tab.value === raw)?.value ?? "all";
