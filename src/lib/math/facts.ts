export type FactOperation = "multiplication" | "division";

export type MathFact = {
  id: string;
  familyId: string;
  operation: FactOperation;
  operandA: number;
  operandB: number;
  result: number;
  table: number;
};

export type FactFamily = {
  id: string;
  a: number;
  b: number;
  product: number;
  facts: MathFact[];
};

const factId = (operation: FactOperation, a: number, b: number) =>
  `${operation === "multiplication" ? "mul" : "div"}:${a}:${b}`;

export function createFactFamily(a: number, b: number): FactFamily {
  const product = a * b;
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const familyId = `family:${low}:${high}:${product}`;
  const candidates: MathFact[] = [
    { id: factId("multiplication", a, b), familyId, operation: "multiplication", operandA: a, operandB: b, result: product, table: a },
    { id: factId("multiplication", b, a), familyId, operation: "multiplication", operandA: b, operandB: a, result: product, table: b },
    { id: factId("division", product, a), familyId, operation: "division", operandA: product, operandB: a, result: b, table: a },
    { id: factId("division", product, b), familyId, operation: "division", operandA: product, operandB: b, result: a, table: b },
  ];

  const deduped = [...new Map(candidates.map((fact) => [fact.id, fact])).values()];
  return { id: familyId, a, b, product, facts: deduped };
}

export function generateMathFacts(minTable = 1, maxTable = 10): MathFact[] {
  const byId = new Map<string, MathFact>();
  for (let a = minTable; a <= maxTable; a += 1) {
    for (let b = 1; b <= 10; b += 1) {
      for (const fact of createFactFamily(a, b).facts) byId.set(fact.id, fact);
    }
  }
  return [...byId.values()];
}

export function formatFact(fact: MathFact) {
  return fact.operation === "multiplication"
    ? `${fact.operandA} × ${fact.operandB}`
    : `${fact.operandA} ÷ ${fact.operandB}`;
}

export function getFactFamily(fact: MathFact, allFacts: MathFact[]) {
  return allFacts.filter((candidate) => candidate.familyId === fact.familyId);
}
