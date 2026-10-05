"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameButton } from "@/components/ui/game-button";
import { formatFact } from "@/lib/math/facts";
import { createDiagnosticState, diagnosticScore, DIAGNOSTIC_LENGTH, selectDiagnosticFact, updateDiagnosticState } from "@/lib/learning-engine/diagnostic";

export type OnboardingProfile = { name: string; hero: string; pet: string; diagnosticScore: number };

const heroes = ["🧙", "🦸", "🧝", "🥷"];
const pets = ["🐶", "🐱", "🦊", "🐲"];

function choices(answer: number) {
  const delta = answer > 20 ? 7 : answer > 10 ? 3 : 2;
  return [...new Set([answer, Math.max(1, answer-delta), answer+delta])].sort((a,b)=>a-b);
}

export function Onboarding({ onComplete }: { onComplete:(profile:OnboardingProfile)=>void }) {
  const [step, setStep] = useState<"name"|"hero"|"pet"|"diagnostic">("name");
  const [name, setName] = useState("");
  const [hero, setHero] = useState(heroes[0]);
  const [pet, setPet] = useState(pets[0]);
  const [diagnostic, setDiagnostic] = useState(createDiagnosticState);
  const [fact, setFact] = useState(()=>selectDiagnosticFact(createDiagnosticState()));
  const startedAt = useRef(Date.now());

  const answer = (value:number) => {
    const next = updateDiagnosticState(diagnostic, fact, { correct:value===fact.result, responseTimeMs:Math.max(300, Date.now()-startedAt.current) });
    if (next.total >= DIAGNOSTIC_LENGTH) {
      onComplete({ name:name.trim()||"Искатель", hero, pet, diagnosticScore:diagnosticScore(next) });
      return;
    }
    setDiagnostic(next);
    setFact(selectDiagnosticFact(next));
    startedAt.current = Date.now();
  };

  return <main className="grid min-h-screen place-items-center px-4 py-8">
    <div className="game-shadow w-full max-w-xl overflow-hidden rounded-[36px] border-4 border-white bg-white/85 p-6 backdrop-blur sm:p-8">
      <div className="text-sm font-black uppercase tracking-[.18em] text-[#7357ff]">Добро пожаловать</div>
      <AnimatePresence mode="wait">
        {step==="name" && <motion.section key="name" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
          <h1 className="mt-2 text-4xl font-black">Как зовут твоего героя?</h1>
          <p className="mt-3 font-semibold text-slate-600">Имя видно только внутри твоего приключения.</p>
          <input autoFocus value={name} onChange={(e)=>setName(e.target.value.slice(0,18))} placeholder="Например, Миша" className="mt-7 w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-xl font-black outline-none focus:border-[#7357ff]"/>
          <GameButton disabled={!name.trim()} onClick={()=>setStep("hero")} className="mt-5 w-full">Дальше</GameButton>
        </motion.section>}

        {step==="hero" && <motion.section key="hero" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
          <h1 className="mt-2 text-4xl font-black">Выбери героя</h1>
          <div className="mt-6 grid grid-cols-4 gap-3">{heroes.map((item)=><button key={item} onClick={()=>setHero(item)} className={`grid aspect-square place-items-center rounded-[24px] text-5xl transition ${hero===item?"bg-[#e9e2ff] ring-4 ring-[#7357ff]":"bg-slate-100"}`}>{item}</button>)}</div>
          <GameButton onClick={()=>setStep("pet")} className="mt-6 w-full">Герой готов</GameButton>
        </motion.section>}

        {step==="pet" && <motion.section key="pet" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
          <h1 className="mt-2 text-4xl font-black">Кто пойдёт с тобой?</h1>
          <p className="mt-3 font-semibold text-slate-600">Питомец будет радоваться победам и поддерживать после сложных примеров.</p>
          <div className="mt-6 grid grid-cols-4 gap-3">{pets.map((item)=><button key={item} onClick={()=>setPet(item)} className={`grid aspect-square place-items-center rounded-[24px] text-5xl transition ${pet===item?"bg-[#e6ffe9] ring-4 ring-[#55bd70]":"bg-slate-100"}`}>{item}</button>)}</div>
          <GameButton onClick={()=>{setStep("diagnostic");startedAt.current=Date.now();}} className="mt-6 w-full">Узнать мою суперсилу ✨</GameButton>
        </motion.section>}

        {step==="diagnostic" && <motion.section key={`d-${diagnostic.total}`} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.96}}>
          <div className="flex items-center justify-between"><span className="font-black">✨ Узнаём суперсилу</span><span className="text-sm font-bold text-slate-500">{diagnostic.total+1}/{DIAGNOSTIC_LENGTH}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#7357ff] transition-all" style={{width:`${((diagnostic.total+1)/DIAGNOSTIC_LENGTH)*100}%`}}/></div>
          <div className="py-10 text-center"><div className="text-6xl font-black">{formatFact(fact)}</div><p className="mt-3 font-bold text-slate-500">Следующий пример подбирается по твоим предыдущим ответам. Это не контрольная 🙂</p></div>
          <div className="grid grid-cols-3 gap-3">{choices(fact.result).map((value)=><motion.button whileTap={{scale:.94}} key={value} onClick={()=>answer(value)} className="min-h-20 rounded-[24px] bg-[#ffd84d] text-3xl font-black shadow-[0_7px_0_#d9aa2c]">{value}</motion.button>)}</div>
          {diagnostic.total===0 && <div className="mt-5 rounded-2xl bg-[#eefaff] p-3 text-center text-sm font-bold text-slate-600">За первый ответ ты уже получишь свою первую ⭐</div>}
        </motion.section>}
      </AnimatePresence>
    </div>
  </main>;
}
