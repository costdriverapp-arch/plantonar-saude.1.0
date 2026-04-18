export type ClientPlanType = "free" | "monthly" | "yearly";

export type ClientCapabilities = {
  candidateLimit: number;
  canPostJob: boolean;
  jobDurationHours: number;
};

export function getClientCapabilities(plan: ClientPlanType): ClientCapabilities {
  switch (plan) {
    case "monthly":
      return {
        candidateLimit: 5,
        canPostJob: true,
        jobDurationHours: 72,
      };

    case "yearly":
      return {
        candidateLimit: 10,
        canPostJob: true,
        jobDurationHours: 72,
      };

    default:
      return {
        candidateLimit: 3,
        canPostJob: true,
        jobDurationHours: 72,
      };
  }
}

export function isSubscriptionActive(subscription: {
  status: string;
  ends_at: string | null;
} | null): boolean {
  if (!subscription) return false;

  if (subscription.status !== "active") return false;

  if (!subscription.ends_at) return false;

  const now = new Date();
  const end = new Date(subscription.ends_at);

  return end > now;
}

export function getClientPlanType(subscription: {
  plan_type: "monthly" | "yearly";
  status: string;
  ends_at: string | null;
} | null): ClientPlanType {
  if (!subscription) return "free";

  if (!isSubscriptionActive(subscription)) return "free";

  return subscription.plan_type;
}