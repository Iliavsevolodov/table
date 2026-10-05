"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { MathFact } from "@/lib/math/facts";
import { formatFact } from "@/lib/math/facts";
import { GameButton } from "@/components/ui/game-button";

function MultiplicationVisual({ fact }: { fact: MathFact }) {
  const groups = Array.from({ length: Math.min(fact.operandA, 10) });
  const items = Array.from({ length: Math.min(fact.operandB, 10) });
  return <div className="mt-6 grid gap-2 sm:grid-cols-2">
    {groups.map((_, groupIndex) => <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:groupIndex*.08}} key={groupIndex} className="flex flex-wrap justify-center gap-1 rounded-2xl bg-[#f1efff] p-3">
      {items.map((__, itemIndex)=><span key={itemIndex} className="text-2xl">⭐</span>)}
    </motion.div>)}
  </div>;
}

function DivisionVisual({ fact }: { fact: MathFact }) {
  const groups = Array.from({ length: Math.min(fact.operandB, 10) });
  const perGroup = Array.from({ length: Math.min(fact.result, 10) });
  return <div className="mt-6 grid gap-2 sm:grid-cols-2">
    {groups.map((_, groupIndex)=><motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:groupIndex*.08}} key={groupIndex} className="rounded-2xl bg-[#e7fbff] p-3 text-center">
      <div className="mb-1 text-xs font-black text-slate-500">КОМАНДА {groupIndex+1}</div>
      <div className="flex flex-wrap justify-center gap-1">{perGroup.map((__,itemIndex)=><span key={itemIndex} className="text-2xl">💎</span>)}</div>
    </motion.div>)}
  </div>;
}

export function LearningIntro({ fact, onReady }: { fact: MathFact; onReady:()=>void }) {
  const isMultiplication = fact.operation === "multiplication";
  return <section className="game-shadow mx-auto mt-4 w-[min(96%,760px)] rounded-[36px] border-4 border-white bg-white p-6 sm:p-8">
    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[.15em] text-[#7357ff]"><Sparkles size={18}/> Новая математическая магия</div>
    <h1 className="mt-3 text-balance text-3xl font-black sm:text-4xl">Сначала разберёмся, а потом сыграем</h1>
    <div className="mt-6 rounded-[28px] bg-[#fff8d9] p-5 text-center">
      <div className="text-5xl font-black">{formatFact(fact)} = {fact.result}</div>
      <p className="mt-3 font-bold text-slate-600">{isMultiplication
        ? `${fact.operandA} одинаковых группы по ${fact.operandB} — вместе ${fact.result}.`
        : `${fact.operandA} предметов делим на ${fact.operandB} равные команды — в каждой будет ${fact.result}.`}</p>
    </div>
    {isMultiplication ? <MultiplicationVisual fact={fact}/> : <DivisionVisual fact={fact}/>}
    <GameButton onClick={onReady} className="mt-7 w-full text-lg"><span className="inline-flex items-center gap-2">Проверить в приключении <ArrowRight size={20}/></span></GameButton>
  </section>;
}
