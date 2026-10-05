import { describe, expect, it } from "vitest";
import { createFactFamily, generateMathFacts } from "@/lib/math/facts";
import { EMPTY_MASTERY, scheduleNextReview, selectNextQuestion, updateMastery } from "@/lib/learning-engine";
import { createDiagnosticState, diagnosticScore, selectDiagnosticFact, updateDiagnosticState } from "@/lib/learning-engine/diagnostic";
import { hintForFact } from "@/lib/learning-engine/hints";

describe("math fact families", () => {
  it("links both multiplication directions and inverse division", () => {
    const family = createFactFamily(7, 8);
    const signatures = family.facts.map((f) => `${f.operation}:${f.operandA}:${f.operandB}:${f.result}`);
    expect(signatures).toContain("multiplication:7:8:56");
    expect(signatures).toContain("multiplication:8:7:56");
    expect(signatures).toContain("division:56:7:8");
    expect(signatures).toContain("division:56:8:7");
  });

  it("does not create duplicated facts for square families", () => {
    expect(createFactFamily(7,7).facts).toHaveLength(2);
  });
});

describe("mastery", () => {
  it("rewards a fast independent answer more than a hinted slow answer", () => {
    const base = EMPTY_MASTERY("mul:7:8");
    const fast = updateMastery(base, { correct:true, responseTimeMs:1800, hintsUsed:0 });
    const hinted = updateMastery(base, { correct:true, responseTimeMs:8000, hintsUsed:2 });
    expect(fast.scoreDelta).toBeGreaterThan(hinted.scoreDelta);
  });

  it("reduces mastery after a wrong answer and resets the streak", () => {
    const base = { ...EMPTY_MASTERY("mul:7:8"), masteryScore:.7, currentStreak:5 };
    const result = updateMastery(base, { correct:false, responseTimeMs:1200, hintsUsed:0 });
    expect(result.mastery.masteryScore).toBeLessThan(.7);
    expect(result.mastery.currentStreak).toBe(0);
  });

  it("does not automate a fact after a single lucky answer", () => {
    const result = updateMastery(EMPTY_MASTERY("mul:7:8"), { correct:true, responseTimeMs:900, hintsUsed:0 });
    expect(result.mastery.masteryLevel).toBeLessThan(6);
  });
});

describe("spaced repetition", () => {
  it("shortens the interval after an error", () => {
    const base = { ...EMPTY_MASTERY("mul:6:7"), intervalDays:7, easeFactor:2.5 };
    const updated = updateMastery(base, { correct:false, responseTimeMs:4000, hintsUsed:0 });
    const scheduled = scheduleNextReview(updated.mastery, { correct:false, responseTimeMs:4000, hintsUsed:0 }, updated.quality);
    expect(scheduled.intervalDays).toBeLessThan(1);
    expect(scheduled.easeFactor).toBeLessThan(base.easeFactor);
  });

  it("grows intervals for repeated successful reviews", () => {
    const base = { ...EMPTY_MASTERY("mul:8:6"), intervalDays:3, easeFactor:2.4 };
    const updated = updateMastery(base, { correct:true, responseTimeMs:2300, hintsUsed:0 });
    const scheduled = scheduleNextReview(updated.mastery, { correct:true, responseTimeMs:2300, hintsUsed:0 }, updated.quality);
    expect(scheduled.intervalDays).toBeGreaterThan(3);
  });
});

describe("question selection", () => {
  it("avoids recently shown facts when alternatives exist", () => {
    const facts = generateMathFacts(2,2).slice(0,5);
    const candidates = facts.map((fact)=>({fact,mastery:EMPTY_MASTERY(fact.id)}));
    const selected = selectNextQuestion(candidates,{recentFactIds:[facts[0].id],random:()=>0});
    expect(selected?.fact.id).not.toBe(facts[0].id);
  });

  it("can select a due review", () => {
    const fact = generateMathFacts(7,7)[0];
    const due = { ...EMPTY_MASTERY(fact.id), attemptsCount:3, masteryScore:.7, nextReviewAt:"2020-01-01T00:00:00.000Z" };
    const selected = selectNextQuestion([{fact,mastery:due}],{now:new Date("2026-01-01T00:00:00Z"),random:()=>0});
    expect(selected?.bucket).toBe("due");
  });
});

describe("adaptive diagnostic", () => {
  it("moves estimated ability upward after a fast correct answer", () => {
    const state = createDiagnosticState();
    const fact = selectDiagnosticFact(state);
    const next = updateDiagnosticState(state, fact, { correct:true, responseTimeMs:1800 });
    expect(next.ability).toBeGreaterThan(state.ability);
    expect(diagnosticScore(next)).toBeGreaterThan(0);
  });

  it("does not immediately repeat an already asked fact", () => {
    const state = createDiagnosticState();
    const first = selectDiagnosticFact(state);
    const next = updateDiagnosticState(state, first, { correct:true, responseTimeMs:2500 });
    expect(selectDiagnosticFact(next).id).not.toBe(first.id);
  });
});

describe("hints", () => {
  it("connects division back to multiplication", () => {
    const fact = generateMathFacts(7,7).find((item)=>item.operation==="division")!;
    expect(hintForFact(fact,2)).toContain("× ? =");
  });
});
