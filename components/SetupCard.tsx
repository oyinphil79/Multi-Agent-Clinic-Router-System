import { ArrowUp, Loader2 } from "lucide-react";
import { BATCHES, MAX_MESSAGES } from "@/lib/batches";

type Props = {
  text: string;
  onText: (v: string) => void;
  preset: string | null;
  onPreset: (id: string) => void;
  onSend: () => void;
  running: boolean;
};

export function SetupCard({ text, onText, preset, onPreset, onSend, running }: Props) {
  const count = text.split("\n").filter((l) => l.trim()).length;
  const tooMany = count > MAX_MESSAGES;
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {BATCHES.map((b) => (
          <button
            key={b.id}
            onClick={() => onPreset(b.id)}
            disabled={running}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition disabled:opacity-50 ${
              preset === b.id ? "bg-zinc-900 text-white ring-zinc-900" : "bg-white text-zinc-600 ring-black/10 hover:ring-black/20"
            }`}
          >
            <span className={`size-1.5 rounded-full ${b.dot}`} />
            {b.label}
          </button>
        ))}
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-zinc-400">
          <span className="size-1.5 rounded-full bg-zinc-300" />
          {preset ? "or edit below" : "Your own"}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        disabled={running}
        rows={6}
        placeholder="One patient message per line, English, Hindi or Hinglish"
        className="w-full resize-none rounded-2xl bg-zinc-50 p-4 text-sm leading-6 outline-none ring-1 ring-black/5 placeholder:text-zinc-400 focus:ring-zinc-300 disabled:opacity-60"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${tooMany ? "text-rose-600" : "text-zinc-400"}`}>
          {count} / {MAX_MESSAGES} messages{tooMany ? ", only the first 6 will be sent" : ""}
        </span>
        <button
          onClick={onSend}
          disabled={running || count === 0}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" strokeWidth={2} />}
          {running ? "Sorting" : "Send to router"}
        </button>
      </div>
    </section>
  );
}
