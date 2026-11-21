export const metricsKeys = {
  all: ["metrics"] as const,
  institution: (institutionId: string) => [...metricsKeys.all, "institution", institutionId] as const,
  campaign: (campaignId: string) => [...metricsKeys.all, "campaign", campaignId] as const,
};
