"use client";

import { Lock, MapPin, Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { GameButton } from "@/components/ui/game-button";

type Props = { onPlay: () => void; mastered: number; sessions: number };

const regions = [
  { table: 2, name: "Долина двойки", emoji: "🌿", pos: "left-[8%] top-[62%]", open: true, tone: "from-[#7bd879] to-[#49b86c]" },
  { table: 3, name: "Остров тройки", emoji: "🏝️", pos: "left-[46%] top-[50%]", open: false, tone: "from-[#6edcf2] to-[#4eb0dd]" },
  { table: 4, name: "Королевство четвёрки", emoji: "🏰", pos: "right-[5%] top-[34%]", open: false, tone: "from-[#f0ae67] to-[#cf745c]" },
  { table: 5, name: "Город пятёрки", emoji: "🎡", pos: "left-[30%] top-[16%]", open: false, tone: "from-[#d993ff] to-[#8d68ed]" },
];

export function WorldMap({ onPlay, mastered, sessions }: Props) {
  return (
    <section className="mx-auto mt-4 w-[min(96%,980px)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-2">
        <div><div className="text-sm font-black uppercase tracking-[.18em] text-[#7357ff]">Мир приключений</div><h1 className="mt-1 text-3xl font-black sm:text-4xl">Куда отправимся сегодня?</h1></div>
        <div className="flex gap-2 text-sm font-black"><span className="rounded-xl bg-white px-3 py-2 shadow">⭐ {mastered} освоено</span><span className="rounded-xl bg-white px-3 py-2 shadow">🧭 {sessions} походов</span></div>
      </div>

      <div className="game-shadow relative h-[620px] overflow-hidden rounded-[38px] border-4 border-white bg-gradient-to-b from-[#8adfff] via-[#dff9ff] to-[#7bcf89] sm:h-[700px]">
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[radial-gradient(ellipse_at_center,#71c977_0%,#57b66d_60%,#49a85f_100%)]" />
        <div className="absolute left-[12%] top-[7%] text-7xl opacity-90 cloudy">☁️</div><div className="absolute right-[12%] top-[12%] text-8xl opacity-90 cloudy">☁️</div>
        <div className="absolute left-[8%] right-[12%] top-[22%] h-[50%] rotate-[-7deg] rounded-[50%] border-[8px] border-dashed border-white/60" />

        {regions.map((region, index) => (
          <motion.div key={region.table} initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * .12 }} className={`absolute ${region.pos} z-10 w-[42%] max-w-[230px]`}>
            <button disabled={!region.open} onClick={region.open ? onPlay : undefined} className={`game-shadow w-full rounded-[28px] bg-gradient-to-b ${region.tone} p-4 text-left text-white transition ${region.open ? "hover:-translate-y-1" : "grayscale-[.28]"}`}>
              <div className="flex items-start justify-between"><span className="text-4xl">{region.emoji}</span>{region.open ? <MapPin/> : <Lock/>}</div>
              <div className="mt-3 text-xs font-black uppercase tracking-[.12em]">Таблица ×{region.table}</div>
              <div className="mt-1 text-lg font-black leading-tight">{region.name}</div>
              {region.open && <div className="mt-3 flex items-center gap-1 text-xs font-black"><Star size={14} fill="currentColor"/> Открыто</div>}
            </button>
          </motion.div>
        ))}

        <div className="absolute bottom-5 left-1/2 z-20 w-[min(90%,420px)] -translate-x-1/2 rounded-[28px] bg-white/88 p-4 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-bold text-slate-500">Сегодня слабые примеры сами попадут в приключение</p>
          <GameButton onClick={onPlay} className="mt-3 w-full text-lg"><span className="inline-flex items-center gap-2"><Play size={20} fill="currentColor"/> ПРОДОЛЖИТЬ ПРИКЛЮЧЕНИЕ</span></GameButton>
        </div>
      </div>
    </section>
  );
}
