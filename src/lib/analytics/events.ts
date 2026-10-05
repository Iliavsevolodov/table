export const ANALYTICS_EVENTS = [
  "session_started","session_completed","question_shown","answer_correct","answer_wrong","hint_used",
  "level_completed","boss_defeated","reward_received","region_unlocked","achievement_unlocked","subscription_started",
] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function trackLocalEvent(name: AnalyticsEventName, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("multikids:analytics", { detail: { name, properties, occurredAt: new Date().toISOString() } }));
}
