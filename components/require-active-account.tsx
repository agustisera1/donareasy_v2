import { redirect } from "next/navigation";
import { getAccountStatus } from "@/queries/user/get-account-status";

// Solo UX: la protección de los datos la hace RLS (ver authentication.md, "Layouts and auth checks").
export async function RequireActiveAccount() {
  const status = await getAccountStatus();
  if (status.ok && status.data !== "active") redirect("/onboarding");
  return null;
}
