import type { MathFact } from "@/lib/math/facts";

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type FactMastery = {
  factId: string;
  masteryScore: number;
  masteryLevel: MasteryLevel;
  attemptsCount: number;
  correctCount: number;
  wrongCount: number;
  averageResponseTimeMs: number | null;
  lastResponseTimeMs: number | null;
  currentStreak: number;
  lastSeenAt: string | null;
  nextReviewAt: string | null;
  intervalDays: number;
  easeFactor: number;
  hintsUsed: number;
  successfulReviews: number;
};

export type AnswerSignal = {
  correct: boolean;
  responseTimeMs: number;
  hintsUsed: number;
  answeredAt?: Date;
};

export type MasteryUpdate = {
  mastery: FactMastery;
  quality: number;
  scoreDelta: number;
};

export type LearningCandidate = {
  fact: MathFact;
  mastery: FactMastery;
};

export type SelectionBucket = "weak" | "due" | "new" | "confidence";

export type SelectedQuestion = LearningCandidate & {
  bucket: SelectionBucket;
};
