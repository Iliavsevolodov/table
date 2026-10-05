"use client";
import { motion } from "motion/react";

export function RoadChoice({ prompt, options, onAnswer, locked }: { prompt: string; options: number[]; onAnswer: (value:number)=>void; locked:boolean }) {
  return (
    <div className="relative min-h-[470px] overflow-hidden rounded-[34px] bg-gradient-to-b from-[#8edcff] to-[#d9f6ff] p-5 sm:p-8">
      <div className="absolute inset-x-0 bottom-0 h-[56%] bg-[#69bf70]" />
      <div className="absolute bottom-0 left-1/2 h-[58%] w-[74%] -translate-x-1/2 bg-[#5c6171] [clip-path:polygon(39%_0,61%_0,100%_100%,0_100%)]" />
      <motion.div animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1.1 }} className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-6xl">🏎️</motion.div>
      <div className="relative z-20 mx-auto max-w-xl text-center">
        <div className="inline-block rounded-full bg-white/85 px-4 py-2 text-sm font-black">🏁 Выбери правильную дорогу</div>
        <div className="mt-4 text-5xl font-black text-[#263454] sm:text-6xl">{prompt}</div>
      </div>
      <div className="absolute inset-x-4 bottom-28 z-20 grid grid-cols-3 gap-3 sm:inset-x-12">
        {options.map((value) => <motion.button disabled={locked} whileTap={{scale:.92}} key={value} onClick={()=>onAnswer(value)} className="min-h-20 rounded-[24px] border-4 border-white bg-[#ffd84d] text-3xl font-black shadow-[0_7px_0_#d8a92d] disabled:opacity-60">{value}</motion.button>)}
      </div>
    </div>
  );
}
