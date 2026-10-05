import type { AnswerSignal, FactMastery, MasteryLevel, MasteryUpdate } from "./types";

export const EMPTY_MASTERY = (factId: string): FactMastery => ({
  factId,
  masteryScore: 0,
  masteryLevel: 0,
  attemptsCount: 0,
  correctCount: 0,
  wrongCount: 0,
  averageResponseTimeMs: null,
  lastResponseTimeMs: null,
  currentStreak: 0,
  lastSeenAt: null,
  nextReviewAt: null,
  intervalDays: 0,
  easeFactor: 2.3,
  hintsUsed: 0,
  successfulReviews: 0,
});

export function scoreToLevel(score: number, automationQualified = false): MasteryLevel {
  if (automationQualified && score >= 0.92) return 6;
  if (score >= 0.82) return 5;
  if (score >= 0.64) return 4;
  if (score >= 0.44) return 3;
  if (score >= 0.25) return 2;
  if (score >= 0.08) return 1;
  return 0;
}

function speedScore(responseTimeMs: number) {
  if (responseTimeMs <= 2400) return 1;
  if (responseTimeMs <= 3600) return 0.82;
  if (responseTimeMs <= 5200) return 0.58;
  if (responseTimeMs <= 8000) return 0.32;
  return 0.12;
}

function answerQuality(signal: AnswerSignal) {
  if (!signal.correct) return 0;
  const hintPenalty = Math.min(0.55, signal.hintsUsed * 0.2);
  return Math.max(0.08, speedScore(signal.responseTimeMs) * (1 - hintPenalty));
}

export function updateMastery(previous: FactMastery, signal: AnswerSignal): MasteryUpdate {
  const quality = answerQuality(signal);
  const answeredAt = signal.answeredAt ?? new Date();
  const attemptsCount = previous.attemptsCount + 1;
  const priorAverage = previous.averageResponseTimeMs ?? signal.responseTimeMs;
  const averageResponseTimeMs = Math.round(
    priorAverage + (signal.responseTimeMs - priorAverage) / attemptsCount,
  );

  let masteryScore = previous.masteryScore;
  if (signal.correct) {
    const evidence = 0.09 + quality * 0.13;
    masteryScore = masteryScore + (1 - masteryScore) * evidence;
  } else {
    const fastGuessPenalty = signal.responseTimeMs < 1600 ? 0.64 : 0.72;
    masteryScore *= fastGuessPenalty;
  }
  masteryScore = Number(Math.min(1, Math.max(0, masteryScore)).toFixed(4));

  const currentStreak = signal.correct ? previous.currentStreak + 1 : 0;
  const successfulReviews = previous.successfulReviews + (signal.correct && previous.intervalDays >= 1 ? 1 : 0);
  const automationQualified =
    masteryScore >= 0.92 &&
    currentStreak >= 4 &&
    successfulReviews >= 2 &&
    signal.hintsUsed === 0 &&
    signal.responseTimeMs <= 3600;

  const mastery: FactMastery = {
    ...previous,
    masteryScore,
    masteryLevel: scoreToLevel(masteryScore, automationQualified),
    attemptsCount,
    correctCount: previous.correctCount + (signal.correct ? 1 : 0),
    wrongCount: previous.wrongCount + (signal.correct ? 0 : 1),
    averageResponseTimeMs,
    lastResponseTimeMs: signal.responseTimeMs,
    currentStreak,
    lastSeenAt: answeredAt.toISOString(),
    hintsUsed: previous.hintsUsed + signal.hintsUsed,
    successfulReviews,
  };

  return { mastery, quality, scoreDelta: Number((masteryScore - previous.masteryScore).toFixed(4)) };
}
