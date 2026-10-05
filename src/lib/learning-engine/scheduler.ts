import type { AnswerSignal, FactMastery } from "./types";

const DAY_MS = 86_400_000;

export function scheduleNextReview(mastery: FactMastery, signal: AnswerSignal, quality: number): FactMastery {
  const now = signal.answeredAt ?? new Date();
  let easeFactor = mastery.easeFactor;
  let intervalDays = mastery.intervalDays;

  if (!signal.correct) {
    easeFactor = Math.max(1.3, easeFactor - 0.18);
    intervalDays = 0.08;
  } else {
    easeFactor = Math.min(3.1, easeFactor + (quality >= 0.8 ? 0.07 : quality < 0.45 ? -0.05 : 0));
    if (intervalDays < 0.2) intervalDays = 0.5;
    else if (intervalDays < 1) intervalDays = 1;
    else intervalDays = Math.min(30, intervalDays * easeFactor * (0.72 + quality * 0.38));
    if (signal.hintsUsed > 0) intervalDays *= 0.65;
  }

  const nextReviewAt = new Date(now.getTime() + intervalDays * DAY_MS).toISOString();
  return {
    ...mastery,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays: Number(intervalDays.toFixed(2)),
    nextReviewAt,
  };
}
