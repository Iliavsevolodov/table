"use client";

import { Flame, Gem, Sparkles } from "lucide-react";
import type { PlayerState } from "@/lib/game-engine";
import { xpForNextLevel } from "@/lib/game-engine";

export function Hud({ player, hero, pet }: { player: PlayerState; hero: string; pet: string }) {
  const need = xpForNextLevel(player.level);
  return (
    <div className="soft-panel sticky top-3 z-30 mx-auto flex w-[min(96%,980px)] items-center gap-2 rounded-[24px] p-2.5 shadow-lg sm:gap-3 sm:p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white/70 p-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#efeaff] text-2xl">{hero}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-xs font-black"><span>Уровень {player.level}</span><span>{player.xp}/{need} XP</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#7357ff] transition-all" style={{ width: `${Math.min(100, (player.xp / need) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="hidden items-center gap-1 rounded-2xl bg-[#fff3b7] px-3 py-2 font-black sm:flex"><Sparkles size={17}/> {player.coins}</div>
      <div className="hidden items-center gap-1 rounded-2xl bg-[#dffcff] px-3 py-2 font-black sm:flex"><Gem size={17}/> {player.gems}</div>
      <div className="flex items-center gap-1 rounded-2xl bg-[#ffe0d8] px-3 py-2 font-black"><Flame size={17}/> {Math.max(1, player.combo)}</div>
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9ffe9] text-2xl">{pet}</div>
    </div>
  );
}
