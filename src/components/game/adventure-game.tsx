"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Hud } from "./hud";
import { WorldMap } from "./world-map";
import { Onboarding } from "./onboarding";
import { RoadChoice } from "./minigames/road-choice";
import { MonsterBattle } from "./minigames/monster-battle";
import { BridgeBuilder } from "./minigames/bridge-builder";
import { GameButton } from "@/components/ui/game-button";
import { generateMathFacts, formatFact, type MathFact } from "@/lib/math/facts";
import { EMPTY_MASTERY, scheduleNextReview, selectNextQuestion, updateMastery, type FactMastery } from "@/lib/learning-engine";
import { INITIAL_PLAYER_STATE, rewardAnswer, type PlayerState } from "@/lib/game-engine";

type Profile = { name:string; hero:string; pet:string; diagnosticScore:number };
type Screen = "map" | "play" | "reward";
type StoredProgress = { profile:Profile; player:PlayerState; mastery:Record<string,FactMastery>; sessions:number; totalAttempts:number; totalCorrect:number };

const STORAGE_KEY = "multikids:progress:v1";
const sessionFacts = generateMathFacts(2,2).filter((fact)=> fact.table === 2);

function answerOptions(fact: MathFact) {
  const correct = fact.result;
  const spread = fact.operation === "multiplication" ? Math.max(2, fact.operandA) : 1;
  const values = [correct, Math.max(1, correct-spread), correct+spread];
  return [...new Set(values)].sort((a,b)=>a-b);
}

export function AdventureGame() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [mastery, setMastery] = useState<Record<string,FactMastery>>({});
  const [sessions, setSessions] = useState(0);
  const [screen, setScreen] = useState<Screen>("map");
  const [recent, setRecent] = useState<string[]>([]);
  const [question, setQuestion] = useState<MathFact | null>(null);
  const [mode, setMode] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [feedback, setFeedback] = useState<{ok:boolean;text:string}|null>(null);
  const [locked, setLocked] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const questionStarted = useRef(Date.now());

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredProgress;
        setProfile(parsed.profile); setPlayer(parsed.player); setMastery(parsed.mastery ?? {}); setSessions(parsed.sessions ?? 0); setTotalAttempts(parsed.totalAttempts ?? 0); setTotalCorrect(parsed.totalCorrect ?? 0);
      } catch { localStorage.removeItem(STORAGE_KEY); }
    }
    setMounted(true);
  },[]);

  useEffect(()=>{
    if (!mounted || !profile) return;
    const data: StoredProgress = { profile, player, mastery, sessions, totalAttempts, totalCorrect };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },[mounted, profile, player, mastery, sessions, totalAttempts, totalCorrect]);

  const mastered = Object.values(mastery).filter((item)=>item.masteryLevel >= 4).length;
  const candidates = useMemo(()=>sessionFacts.map((fact)=>({ fact, mastery: mastery[fact.id] ?? EMPTY_MASTERY(fact.id) })),[mastery]);

  const pickNext = (recentIds = recent) => {
    const selected = selectNextQuestion(candidates.map((candidate)=>({ ...candidate, mastery: mastery[candidate.fact.id] ?? candidate.mastery })), { recentFactIds: recentIds });
    if (selected) {
      setQuestion(selected.fact);
      questionStarted.current = Date.now();
      setRecent((prev)=>[selected.fact.id, ...prev.filter((id)=>id!==selected.fact.id)].slice(0,4));
    }
  };

  const startSession = () => {
    setAnswered(0); setSessionCorrect(0); setMode(sessions % 3); setFeedback(null); setScreen("play"); setChestOpen(false);
    const selected = selectNextQuestion(candidates, { recentFactIds: recent });
    if (selected) { setQuestion(selected.fact); questionStarted.current = Date.now(); }
  };

  const submit = (value:number) => {
    if (!question || locked) return;
    setLocked(true);
    const responseTimeMs = Math.max(300, Date.now()-questionStarted.current);
    const correct = value === question.result;
    const previous = mastery[question.id] ?? EMPTY_MASTERY(question.id);
    const update = updateMastery(previous, { correct, responseTimeMs, hintsUsed: 0 });
    const scheduled = scheduleNextReview(update.mastery, { correct, responseTimeMs, hintsUsed:0 }, update.quality);
    setMastery((prev)=>({ ...prev, [question.id]: scheduled }));
    const game = rewardAnswer(player, { correct, responseTimeMs, hintsUsed:0 });
    setPlayer(game.state);
    setTotalAttempts((v)=>v+1);
    if (correct) { setSessionCorrect((v)=>v+1); setTotalCorrect((v)=>v+1); }
    setFeedback(correct ? {ok:true,text: responseTimeMs <= 3500 ? "Молниеносно! ⚡" : "Есть! Отличный ход ⭐"} : {ok:false,text:`Почти! ${formatFact(question)} = ${question.result}. Мы ещё встретим этот пример.`});

    const nextAnswered = answered + 1;
    setAnswered(nextAnswered);
    window.setTimeout(()=>{
      setFeedback(null); setLocked(false);
      if (nextAnswered >= 12) {
        setSessions((v)=>v+1); setScreen("reward"); return;
      }
      if (nextAnswered % 4 === 0) setMode((v)=>(v+1)%3);
      pickNext([question.id, ...recent]);
    }, correct ? 650 : 1250);
  };

  if (!mounted) return <main className="grid min-h-screen place-items-center text-5xl">✨</main>;
  if (!profile) return <Onboarding onComplete={(value)=>{ setProfile(value); setPlayer({...INITIAL_PLAYER_STATE, coins:5}); setScreen("map"); }} />;

  if (screen === "reward") {
    return <main className="grid min-h-screen place-items-center px-4 py-8"><div className="game-shadow w-full max-w-lg rounded-[38px] bg-white p-7 text-center">
      <div className="text-sm font-black uppercase tracking-[.18em] text-[#7357ff]">Приключение завершено</div>
      <motion.button onClick={()=>setChestOpen(true)} animate={!chestOpen?{scale:[1,1.06,1],rotate:[0,-2,2,0]}:{scale:1}} transition={{repeat:chestOpen?0:Infinity,duration:1.4}} className="mx-auto mt-7 grid h-40 w-40 place-items-center rounded-[36px] bg-[#ffe88c] text-8xl shadow-[0_10px_0_#d4aa37]">{chestOpen?"✨":"🎁"}</motion.button>
      <AnimatePresence>{chestOpen && <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="mt-7"><div className="text-3xl font-black">Сундук открыт!</div><p className="mt-2 font-bold text-slate-600">+25 монет за завершённую экспедицию и {sessionCorrect}/12 правильных ответов.</p><GameButton onClick={()=>{setPlayer((p)=>({...p,coins:p.coins+25}));setScreen("map");}} className="mt-6 w-full">Вернуться на карту</GameButton></motion.div>}</AnimatePresence>
      {!chestOpen && <p className="mt-6 font-bold text-slate-500">Нажми на сундук</p>}
    </div></main>;
  }

  return <main className="min-h-screen pb-8 pt-3">
    <Hud player={player} hero={profile.hero} pet={profile.pet}/>
    {screen === "map" && <WorldMap onPlay={startSession} mastered={mastered} sessions={sessions}/>}
    {screen === "play" && question && <section className="mx-auto mt-4 w-[min(96%,900px)]">
      <div className="mb-3 flex items-center justify-between px-2"><button onClick={()=>setScreen("map")} className="rounded-xl bg-white px-3 py-2 text-sm font-black shadow"><RotateCcw size={15} className="mr-1 inline"/>Карта</button><div className="rounded-xl bg-white px-3 py-2 text-sm font-black shadow">Задание {answered+1}/12</div></div>
      <div className="relative">
        {mode===0 && <RoadChoice prompt={formatFact(question)} options={answerOptions(question)} onAnswer={submit} locked={locked}/>}
        {mode===1 && <MonsterBattle prompt={formatFact(question)} options={answerOptions(question)} onAnswer={submit} locked={locked} damage={(answered%4)*24}/>}
        {mode===2 && <BridgeBuilder prompt={formatFact(question)} options={answerOptions(question)} onAnswer={submit} locked={locked} planks={answered%5}/>}
        <AnimatePresence>{feedback && <motion.div initial={{opacity:0,y:15,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10}} className={`absolute inset-x-4 bottom-4 z-40 rounded-[24px] p-4 text-center text-lg font-black shadow-2xl sm:inset-x-16 ${feedback.ok?"bg-[#dfffe2] text-[#24552b]":"bg-white text-[#5a4053]"}`}>{feedback.text}</motion.div>}</AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-500"><Sparkles size={16}/> Слабые примеры вернутся позже автоматически</div>
    </section>}
  </main>;
}
