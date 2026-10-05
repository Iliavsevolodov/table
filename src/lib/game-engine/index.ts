export type PlayerState = {
  level: number;
  xp: number;
  coins: number;
  gems: number;
  combo: number;
  unlockedRegions: number[];
};

export type GameReward = {
  kind: "xp" | "coins" | "gems" | "level-up";
  amount: number;
};

export const INITIAL_PLAYER_STATE: PlayerState = {
  level: 1,
  xp: 0,
  coins: 0,
  gems: 0,
  combo: 0,
  unlockedRegions: [2],
};

export function xpForNextLevel(level: number) {
  return 80 + level * 45;
}

export function rewardAnswer(
  state: PlayerState,
  input: { correct: boolean; responseTimeMs: number; hintsUsed: number },
): { state: PlayerState; rewards: GameReward[] } {
  if (!input.correct) return { state: { ...state, combo: 0 }, rewards: [] };

  const combo = state.combo + 1;
  const speedBonus = input.responseTimeMs <= 3500 ? 4 : 0;
  const hintPenalty = Math.min(5, input.hintsUsed * 2);
  const xpEarned = Math.max(5, 10 + speedBonus + Math.min(8, combo) - hintPenalty);
  const coinsEarned = 2 + Math.floor(Math.min(combo, 10) / 3);

  let level = state.level;
  let xp = state.xp + xpEarned;
  const rewards: GameReward[] = [
    { kind: "xp", amount: xpEarned },
    { kind: "coins", amount: coinsEarned },
  ];

  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
    rewards.push({ kind: "level-up", amount: level });
  }

  return {
    state: { ...state, level, xp, coins: state.coins + coinsEarned, combo },
    rewards,
  };
}
