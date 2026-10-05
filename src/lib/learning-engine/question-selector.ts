import type { LearningCandidate, SelectedQuestion, SelectionBucket } from "./types";

const DEFAULT_WEIGHTS: Record<SelectionBucket, number> = {
  weak: 0.4,
  due: 0.25,
  new: 0.2,
  confidence: 0.15,
};

function bucketOf(candidate: LearningCandidate, now: Date): SelectionBucket {
  if (candidate.mastery.attemptsCount === 0) return "new";
  if (candidate.mastery.masteryScore < 0.58) return "weak";
  if (candidate.mastery.nextReviewAt && new Date(candidate.mastery.nextReviewAt) <= now) return "due";
  return "confidence";
}

function weightedBucket(available: SelectionBucket[], random: () => number) {
  const sum = available.reduce((acc, bucket) => acc + DEFAULT_WEIGHTS[bucket], 0);
  let cursor = random() * sum;
  for (const bucket of available) {
    cursor -= DEFAULT_WEIGHTS[bucket];
    if (cursor <= 0) return bucket;
  }
  return available[available.length - 1];
}

export function selectNextQuestion(
  candidates: LearningCandidate[],
  options: { now?: Date; recentFactIds?: string[]; random?: () => number } = {},
): SelectedQuestion | null {
  if (!candidates.length) return null;
  const now = options.now ?? new Date();
  const random = options.random ?? Math.random;
  const recent = new Set(options.recentFactIds ?? []);
  const freshPool = candidates.filter((candidate) => !recent.has(candidate.fact.id));
  const pool = freshPool.length ? freshPool : candidates;

  const groups = new Map<SelectionBucket, LearningCandidate[]>();
  for (const candidate of pool) {
    const bucket = bucketOf(candidate, now);
    groups.set(bucket, [...(groups.get(bucket) ?? []), candidate]);
  }

  const available = [...groups.keys()];
  const bucket = weightedBucket(available, random);
  const group = groups.get(bucket)!;
  const index = Math.min(group.length - 1, Math.floor(random() * group.length));
  return { ...group[index], bucket };
}
