"use client";
import { motion } from "motion/react";

export function BridgeBuilder({ prompt, options, onAnswer, locked, planks }: { prompt:string; options:number[]; onAnswer:(value:number)=>void; locked:boolean; planks:number }) {
  return (
    <div className="relative min-h-[470px] overflow-hidden rounded-[34px] bg-gradient-to-b from-[#a9e8ff] to-[#f0fbff] p-5 sm:p-8">
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#4ab5d8]"/><div className="absolute bottom-[35%] left-0 h-[22%] w-[26%] rounded-tr-[70%] bg-[#6ecb75]"/><div className="absolute bottom-[35%] right-0 h-[22%] w-[26%] rounded-tl-[70%] bg-[#6ecb75]"/>
      <div className="relative z-10 text-center"><div className="inline-block rounded-full bg-white px-4 py-2 text-sm font-black">🌉 Построй мост ответами</div><div className="mt-4 text-5xl font-black sm:text-6xl">{prompt}</div></div>
      <div className="absolute bottom-[35%] left-[24%] right-[24%] z-10 flex items-end justify-center gap-1">
        {Array.from({length:5}).map((_,i)=><motion.div initial={false} animate={{opacity:i<planks?1:.18,y:i<planks?0:12}} key={i} className="h-4 flex-1 rounded bg-[#a86c3a] shadow"/>)}
      </div>
      <div className="absolute inset-x-4 bottom-8 z-20 grid grid-cols-3 gap-3 sm:inset-x-10">
        {options.map((value)=><motion.button key={value} disabled={locked} whileTap={{scale:.92}} onClick={()=>onAnswer(value)} className="min-h-20 rounded-[24px] bg-[#ffd84d] text-3xl font-black shadow-[0_7px_0_#d4a126] disabled:opacity-60">{value}</motion.button>)}
      </div>
    </div>
  );
}
