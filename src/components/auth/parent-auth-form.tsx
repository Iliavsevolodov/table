"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ParentAuthForm() {
  const router = useRouter();
  const [mode,setMode] = useState<"signin"|"signup">("signin");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);

  const submit = async (e:FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options:{ emailRedirectTo:`${location.origin}/auth/callback` } });
        if (error) throw error;
        setMessage("Проверьте почту, чтобы подтвердить аккаунт.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/parent"); router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить вход");
    } finally { setBusy(false); }
  };

  return <form onSubmit={submit} className="game-shadow w-full max-w-md rounded-[34px] bg-white p-7">
    <div className="text-sm font-black uppercase tracking-[.16em] text-[#7357ff]">Аккаунт родителя</div>
    <h1 className="mt-2 text-3xl font-black">{mode==="signin"?"Войти":"Создать аккаунт"}</h1>
    <label className="mt-6 block text-sm font-black">Email<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#7357ff]"/></label>
    <label className="mt-4 block text-sm font-black">Пароль<input type="password" required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#7357ff]"/></label>
    <button disabled={busy} className="mt-6 min-h-13 w-full rounded-2xl bg-[#7357ff] px-5 py-3 font-black text-white shadow-[0_7px_0_#4e39c9] disabled:opacity-50">{busy?"Подключаем…":mode==="signin"?"Войти":"Зарегистрироваться"}</button>
    {message && <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{message}</div>}
    <button type="button" onClick={()=>setMode(mode==="signin"?"signup":"signin")} className="mt-5 w-full text-sm font-black text-[#7357ff]">{mode==="signin"?"Нет аккаунта? Создать":"Уже есть аккаунт? Войти"}</button>
  </form>;
}
