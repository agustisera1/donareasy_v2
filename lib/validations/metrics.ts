import * as z from "zod";

export const institutionMetricsSchema = z.object({ institutionId: z.uuid() });
export type InstitutionMetricsInput = z.infer<typeof institutionMetricsSchema>;

export const campaignMetricsSchema = z.object({ campaignId: z.uuid() });
export type CampaignMetricsInput = z.infer<typeof campaignMetricsSchema>;
