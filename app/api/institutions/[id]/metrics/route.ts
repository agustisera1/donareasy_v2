import type { NextRequest } from "next/server";

import { toHttpResponse } from "@/lib/shared/http";
import { getInstitutionMetrics } from "@/queries/metrics/get-institution-metrics";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/institutions/[id]/metrics">) {
  const { id } = await ctx.params;
  return toHttpResponse(await getInstitutionMetrics({ institutionId: id }));
}
