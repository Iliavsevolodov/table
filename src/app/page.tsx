import Link from "next/link";
import { ArrowRight, Brain, Gamepad2, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/config/brand";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="rounded-2xl bg-white/80 px-4 py-2 text-xl font-black tracking-tight shadow-sm">{BRAND.name}</div>
        <Link href="/parent" className="rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold">Родителям</Link>
      </nav>

      <section className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 py-14 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fff1a8] px-4 py-2 text-sm font-black">
            <Sparkles size={18} /> Математика, которую хочется запускать самому
          </div>
          <h1 className="text-balance text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl">
            Не тренажёр. <span className="text-[#7357ff]">Приключение,</span> где числа дают суперсилу.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600 sm:text-xl">{BRAND.tagline}. Игра замечает слабые примеры, возвращает их вовремя и отличает уверенное знание от случайной удачи.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/game" className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#7357ff] px-6 py-4 font-black text-white shadow-[0_8px_0_#4e39c9]">Начать приключение <ArrowRight size={20}/></Link>
            <Link href="/parent" className="inline-flex min-h-14 items-center rounded-2xl bg-white px-6 py-4 font-black shadow-[0_8px_0_rgba(21,33,59,.08)]">Посмотреть прогресс</Link>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute left-[5%] top-[8%] h-28 w-28 rounded-full bg-[#ffd84d] blur-[1px]" />
          <div className="absolute right-[4%] top-[2%] text-7xl cloudy">☁️</div>
          <div className="absolute left-[2%] top-[40%] text-7xl cloudy">☁️</div>
          <div className="game-shadow floaty absolute inset-x-[8%] top-[18%] rounded-[42px] border-4 border-white bg-gradient-to-b from-[#86e086] to-[#56bd70] p-7 text-white">
            <div className="text-sm font-black uppercase tracking-[.18em] text-white/80">Первый регион</div>
            <div className="mt-2 text-4xl font-black">🌿 Долина двойки</div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {["🏁 Гонка", "🐲 Битва", "🌉 Мост"].map((item) => <div key={item} className="rounded-2xl bg-white/20 p-4 text-center font-black backdrop-blur">{item}</div>)}
            </div>
            <div className="mt-6 rounded-3xl bg-[#25344e]/18 p-5">
              <div className="text-sm font-extrabold">Сейчас в приключении</div>
              <div className="mt-2 text-5xl font-black">2 × 8 = ?</div>
            </div>
          </div>
          <div className="absolute bottom-[1%] left-[12%] text-8xl">🧙</div>
          <div className="absolute bottom-[5%] right-[12%] text-7xl floaty">🐲</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 pb-12 sm:grid-cols-3">
        {[
          [Gamepad2, "Игра прежде всего", "Три разные механики уже в первом регионе: выбор пути, битва и строительство моста."],
          [Brain, "Адаптивное обучение", "Mastery учитывает правильность, скорость, подсказки, серии и интервальные повторения."],
          [ShieldCheck, "Безопасно для ребёнка", "Без рекламы, открытых чатов, геолокации и покупок из детского интерфейса."],
        ].map(([Icon, title, text]) => {
          const C = Icon as typeof Brain;
          return <article key={String(title)} className="soft-panel rounded-[30px] p-6 game-shadow"><C className="mb-4"/><h2 className="text-xl font-black">{String(title)}</h2><p className="mt-2 font-semibold leading-relaxed text-slate-600">{String(text)}</p></article>;
        })}
      </section>
    </main>
  );
}
