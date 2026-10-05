"use client";
import { motion } from "motion/react";

export function MonsterBattle({ prompt, options, onAnswer, locked, damage }: { prompt:string; options:number[]; onAnswer:(value:number)=>void; locked:boolean; damage:number }) {
  const health = Math.max(8, 100 - damage);
  return (
    <div className="relative min-h-[470px] overflow-hidden rounded-[34px] bg-gradient-to-b from-[#8c6deb] via-[#5e58c7] to-[#2c3f6d] p-5 text-white sm:p-8">
      <div className="absolute -bottom-16 left-[-10%] h-52 w-[120%] rounded-[50%] bg-[#283a58]" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div><div className="text-5xl">🧙</div><div className="mt-2 text-xs font-black">ТВОЙ ХОД</div></div>
        <motion.div animate={{ rotate: damage ? [-2,2,-2] : 0 }} transition={{ duration:.35 }} className="text-right"><div className="text-7xl">🐲</div><div className="mt-2 h-3 w-32 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-[#ff766f] transition-all" style={{width:`${health}%`}}/></div></motion.div>
      </div>
      <div className="relative z-10 mx-auto mt-7 max-w-lg rounded-[28px] bg-white/12 p-5 text-center backdrop-blur">
        <div className="text-sm font-black text-white/75">ЗАРЯДИ ЗАКЛИНАНИЕ</div><div className="mt-2 text-5xl font-black sm:text-6xl">{prompt}</div>
      </div>
      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        {options.map((value)=><motion.button key={value} disabled={locked} whileTap={{scale:.92}} onClick={()=>onAnswer(value)} className="min-h-20 rounded-[24px] bg-white text-3xl font-black text-[#3d3a77] shadow-[0_7px_0_rgba(10,18,52,.35)] disabled:opacity-60">{value}</motion.button>)}
      </div>
    </div>
  );
}
