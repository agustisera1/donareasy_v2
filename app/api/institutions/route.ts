import { toHttpResponse } from "@/lib/shared/http";
import { listInstitutions } from "@/queries/institutions/list-institutions";

export async function GET() {
  return toHttpResponse(await listInstitutions());
}
