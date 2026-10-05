"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Clock3, LockKeyhole, ShieldCheck, Target } from "lucide-react";
import { formatFact, generateMathFacts } from "@/lib/math/facts";
import type { FactMastery } from "@/lib/learning-engine";
import type { PlayerState } from "@/lib/game-engine";

type StoredProgress = {
  profile: { name:string; hero:string; pet:string; diagnosticScore:number };
  player: PlayerState;
  mastery: Record<string,FactMastery>;
  sessions:number;
  totalAttempts:number;
  totalCorrect:number;
};

const STORAGE_KEY = "multikids:progress:v1";
const allFacts = generateMathFacts(1,10);

function levelLabel(level:number) {
  if (level >= 6) return "⭐ мастер";
  if (level >= 4) return "🟢 знаю";
  if (level >= 3) return "🟡 почти знаю";
  if (level >= 1) return "🟠 тренируюсь";
  return "🔴 начинаю";
}

export function ParentDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState<StoredProgress | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { setProgress(JSON.parse(raw)); } catch {} }
    return ()=>{ if (timer.current) clearTimeout(timer.current); };
  },[]);

  const startHold = () => {
    setHolding(true);
    timer.current = setTimeout(()=>{setUnlocked(true);setHolding(false);},3000);
  };
  const cancelHold = () => { setHolding(false); if (timer.current) clearTimeout(timer.current); };

  const stats = useMemo(()=>{
    if (!progress) return null;
    const masteries = Object.values(progress.mastery ?? {});
    const attempted = masteries.filter((m)=>m.attemptsCount>0);
    const avgScore = attempted.length ? attempted.reduce((s,m)=>s+m.masteryScore,0)/attempted.length : 0;
    const weak = attempted.filter((m)=>m.masteryScore<.58).sort((a,b)=>a.masteryScore-b.masteryScore).slice(0,5);
    const weakFacts = weak.map((m)=>allFacts.find((f)=>f.id===m.factId)).filter(Boolean);
    const avgTime = attempted.length ? Math.round(attempted.reduce((s,m)=>s+(m.averageResponseTimeMs??0),0)/attempted.length/100)/10 : 0;
    return { attempted, avgScore, weakFacts, avgTime };
  },[progress]);

  if (!unlocked) return <main className="grid min-h-screen place-items-center px-4"><div className="game-shadow w-full max-w-md rounded-[34px] bg-white p-7 text-center">
    <LockKeyhole className="mx-auto" size={42}/><h1 className="mt-4 text-3xl font-black">Родительский режим</h1><p className="mt-3 font-semibold leading-relaxed text-slate-600">Удерживайте кнопку 3 секунды. Это простой барьер, чтобы ребёнок случайно не открыл настройки и подписку.</p>
    <button onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} className={`mt-6 min-h-16 w-full rounded-2xl font-black text-white transition ${holding?"bg-[#4e39c9] scale-[.98]":"bg-[#7357ff]"}`}>{holding?"Продолжайте удерживать…":"Удерживать для входа"}</button>
    <Link href="/game" className="mt-5 inline-flex items-center gap-1 font-black text-slate-500"><ArrowLeft size={16}/> Вернуться в игру</Link>
  </div></main>;

  return <main className="min-h-screen px-4 py-6 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-sm font-black uppercase tracking-[.16em] text-[#7357ff]">Родительский кабинет</div><h1 className="mt-1 text-4xl font-black">{progress ? `Прогресс: ${progress.profile.name}` : "Прогресс ребёнка"}</h1></div><Link href="/game" className="rounded-2xl bg-white px-4 py-3 font-black shadow">← В игру</Link></div>

    {!progress ? <div className="game-shadow mt-8 rounded-[34px] bg-white p-8"><Brain size={42}/><h2 className="mt-4 text-2xl font-black">Пока нет данных обучения</h2><p className="mt-2 max-w-2xl font-semibold text-slate-600">После первой диагностики и игровой сессии здесь появятся реальные знания, скорость ответов и слабые примеры — без демонстрационных цифр.</p><Link href="/game" className="mt-5 inline-block rounded-2xl bg-[#7357ff] px-5 py-3 font-black text-white">Начать первое приключение</Link></div> : stats && <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Target,"Освоение",`${Math.round(stats.avgScore*100)}%`],
          [Brain,"Фактов встречено",String(stats.attempted.length)],
          [Clock3,"Средний ответ",stats.avgTime?`${stats.avgTime} сек` : "—"],
          [ShieldCheck,"Точность",progress.totalAttempts?`${Math.round(progress.totalCorrect/progress.totalAttempts*100)}%`:"—"],
        ].map(([Icon,label,value])=>{const C=Icon as typeof Target;return <div key={String(label)} className="game-shadow rounded-[28px] bg-white p-5"><C/><div className="mt-4 text-sm font-black text-slate-500">{String(label)}</div><div className="mt-1 text-3xl font-black">{String(value)}</div></div>})}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="game-shadow rounded-[34px] bg-white p-6"><h2 className="text-2xl font-black">Карта знаний</h2><p className="mt-2 font-semibold text-slate-500">Сейчас MVP сохраняет реальные данные первого региона. После открытия новых регионов таблица заполнится автоматически.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[2,3,4,5,6,7,8,9].map((table)=>{
            const ms = stats.attempted.filter((m)=>{const fact=allFacts.find((f)=>f.id===m.factId);return fact?.table===table;});
            const avg = ms.length?ms.reduce((s,m)=>s+m.masteryScore,0)/ms.length:0;
            return <div key={table} className="rounded-2xl bg-slate-50 p-4"><div className="text-xl font-black">×{table}</div><div className="mt-2 text-2xl font-black">{Math.round(avg*100)}%</div><div className="mt-1 text-xs font-bold text-slate-500">{levelLabel(ms.length?Math.round(ms.reduce((s,m)=>s+m.masteryLevel,0)/ms.length):0)}</div></div>;
          })}</div>
        </div>
        <div className="game-shadow rounded-[34px] bg-[#f3efff] p-6"><h2 className="text-2xl font-black">Короткий отчёт</h2><p className="mt-4 font-semibold leading-relaxed text-slate-700">{progress.profile.name} завершил(а) {progress.sessions} игровых сессий. Текущий средний уровень освоения встреченных фактов — {Math.round(stats.avgScore*100)}%. {stats.weakFacts.length ? `Сейчас полезнее всего повторять: ${stats.weakFacts.map((f)=>f?`${formatFact(f)} = ${f.result}`:"").join(", ")}.` : "Слабые факты пока не определены."}</p></div>
      </section>
    </>}
  </div></main>;
}
