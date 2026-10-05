import type { MathFact } from "@/lib/math/facts";

export function hintForFact(fact: MathFact, level: number) {
  if (fact.operation === "division") {
    if (level <= 1) return `Ищи число, которое нужно умножить на ${fact.operandB}, чтобы получить ${fact.operandA}.`;
    if (level === 2) return `${fact.operandB} × ? = ${fact.operandA}`;
    return `Ответ находится в семье чисел ${fact.operandB}, ${fact.result} и ${fact.operandA}.`;
  }

  const a = fact.operandA;
  const b = fact.operandB;
  if (a === 2) {
    if (level <= 1) return `Умножить на 2 — значит взять ${b} два раза.`;
    if (level === 2) return `${b} + ${b} = ?`;
    return `${b} + ${b} = ${fact.result}`;
  }
  if (level <= 1) return `Можно разложить: ${a} × ${b} = ${Math.max(1,a-1)} × ${b} + ${b}.`;
  if (level === 2) return `Сначала найди ${Math.max(1,a-1)} × ${b}, затем прибавь ещё ${b}.`;
  return `Эта математическая семья даёт результат ${fact.result}.`;
}
