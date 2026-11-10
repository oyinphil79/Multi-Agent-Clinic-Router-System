import { Split } from "lucide-react";
import { LANES, type Lane } from "@/lib/types";
import { LANE_META } from "./lane-meta";

type Props = { counts: Record<Lane, number>; latest: Lane | null };

export function Lanes({ counts, latest }: Props) {
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Split className="size-4 text-zinc-400" strokeWidth={1.75} />
        Router
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LANES.map((lane) => {
          const meta = LANE_META[lane];
          const Icon = meta.icon;
          const lit = latest === lane;
          return (
            <div
              key={lane}
              className={`rounded-2xl p-3 ring-1 transition duration-300 ${lit ? meta.lit : "bg-zinc-50/60 ring-black/5"}`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`size-4 ${lit && lane === "emergency" ? "text-rose-600" : "text-zinc-400"}`} strokeWidth={1.75} />
                <span className="text-xl font-medium tabular-nums tracking-tight">{counts[lane]}</span>
              </div>
              <p className={`mt-3 text-xs ${lit && lane === "emergency" ? "text-rose-700" : "text-zinc-500"}`}>{meta.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-400">
        Gemini picks a lane, then a word list double-checks for urgent phrases. Emergencies skip the bot.
      </p>
    </section>
  );
}
