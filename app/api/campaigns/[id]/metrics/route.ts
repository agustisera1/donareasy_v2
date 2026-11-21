import type { NextRequest } from "next/server";

import { toHttpResponse } from "@/lib/shared/http";
import { getCampaignMetrics } from "@/queries/metrics/get-campaign-metrics";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/campaigns/[id]/metrics">) {
  const { id } = await ctx.params;
  return toHttpResponse(await getCampaignMetrics({ campaignId: id }));
}
