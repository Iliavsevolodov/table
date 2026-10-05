import { generateMathFacts, type MathFact } from "@/lib/math/facts";

export type DiagnosticState = {
  ability: number;
  askedFactIds: string[];
  correct: number;
  total: number;
};

export const DIAGNOSTIC_LENGTH = 18;

const pool = generateMathFacts(2, 9).filter((fact) => {
  if (fact.operation === "multiplication") {
    return fact.operandA === fact.table && fact.operandB >= 2 && fact.operandB <= 9;
  }
  return fact.operandB === fact.table && fact.result >= 2 && fact.result <= 9;
});

function difficulty(fact: MathFact) {
  const tableDifficulty = (fact.table - 2) / 7;
  const partner = fact.operation === "multiplication" ? fact.operandB : fact.result;
  const partnerDifficulty = (partner - 2) / 7;
  const divisionBonus = fact.operation === "division" ? 0.07 : 0;
  const hardPairBonus = fact.table >= 6 && partner >= 6 ? 0.09 : 0;
  return Math.min(1, 0.12 + tableDifficulty * 0.5 + partnerDifficulty * 0.29 + divisionBonus + hardPairBonus);
}

export function createDiagnosticState(): DiagnosticState {
  return { ability: 0.34, askedFactIds: [], correct: 0, total: 0 };
}

export function selectDiagnosticFact(state: DiagnosticState): MathFact {
  const unused = pool.filter((fact) => !state.askedFactIds.includes(fact.id));
  const candidates = unused.length ? unused : pool;
  const lastIds = state.askedFactIds.slice(-3);

  return [...candidates].sort((a, b) => {
    const aTablePenalty = lastIds.some((id) => id.includes(`:${a.table}:`)) ? 0.08 : 0;
    const bTablePenalty = lastIds.some((id) => id.includes(`:${b.table}:`)) ? 0.08 : 0;
    return Math.abs(difficulty(a) - state.ability) + aTablePenalty - (Math.abs(difficulty(b) - state.ability) + bTablePenalty);
  })[0];
}

export function updateDiagnosticState(
  state: DiagnosticState,
  fact: MathFact,
  input: { correct: boolean; responseTimeMs: number },
): DiagnosticState {
  const speed = input.responseTimeMs <= 3500 ? 1 : input.responseTimeMs <= 6500 ? 0.65 : 0.35;
  const target = input.correct ? Math.min(1, difficulty(fact) + 0.12 * speed) : Math.max(0.05, difficulty(fact) - 0.2);
  const ability = state.ability * 0.68 + target * 0.32;
  return {
    ability: Number(ability.toFixed(4)),
    askedFactIds: [...state.askedFactIds, fact.id],
    correct: state.correct + (input.correct ? 1 : 0),
    total: state.total + 1,
  };
}

export function diagnosticScore(state: DiagnosticState) {
  if (!state.total) return 0;
  const accuracy = state.correct / state.total;
  return Number((accuracy * 0.7 + state.ability * 0.3).toFixed(4));
}
