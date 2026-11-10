"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

type Props = { value: string; onChange: (v: string) => void; error: string | null };

export function KeyBar({ value, onChange, error }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="card p-4 sm:p-5">
      <label htmlFor="gemini-key" className="mb-2 flex items-center gap-2 text-sm font-medium">
        <KeyRound className="size-4 text-zinc-400" strokeWidth={1.75} />
        Gemini API key
      </label>
      <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-4 ring-1 ring-black/5 focus-within:ring-zinc-300">
        <input
          id="gemini-key"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your key, it stays in this tab only"
          autoComplete="off"
          spellCheck={false}
          className="h-10 flex-1 bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide key" : "Show key"}
          className="text-zinc-400 hover:text-zinc-700"
        >
          {show ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 px-1 text-sm text-rose-600">{error}</p>
      ) : (
        <p className="mt-2 px-1 text-xs text-zinc-400">Kept in sessionStorage and sent only as a request header. Never saved on the server.</p>
      )}
    </div>
  );
}
