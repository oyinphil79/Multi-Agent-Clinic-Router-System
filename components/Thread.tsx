import { Bot, Loader2, ShieldAlert, User, UserRound } from "lucide-react";
import type { ThreadItem } from "@/lib/types";
import { LANE_META } from "./lane-meta";

export function Thread({ items }: { items: ThreadItem[] }) {
  if (!items.length) {
    return (
      <div className="card grid place-items-center p-10 text-center text-sm text-zinc-400">
        Conversations show up here, one card per message.
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <Conversation item={item} />
        </li>
      ))}
    </ol>
  );
}

function Conversation({ item }: { item: ThreadItem }) {
  const meta = item.route ? LANE_META[item.route.lane] : null;
  const human = item.route?.lane === "emergency";
  return (
    <article className={`card space-y-3 p-4 sm:p-5 ${item.status === "queued" ? "opacity-50" : ""}`}>
      <div className="flex gap-3">
        <Avatar><User className="size-3.5" strokeWidth={1.75} /></Avatar>
        <p className="pt-0.5 text-sm leading-6">{item.message}</p>
      </div>

      {item.status === "routing" && <Pending label="Router is reading" />}

      {item.route && meta && (
        <div className="ml-9 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.chip}`}>
              <span className={`size-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            {item.route.safetyNet && (
              <span className="flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white">
                <ShieldAlert className="size-3" strokeWidth={2} />
                Safety net
              </span>
            )}
            <span className="font-mono text-[11px] text-zinc-400">
              {item.route.at} · {(item.route.ms / 1000).toFixed(1)}s
            </span>
          </div>
          <p className="text-xs leading-5 text-zinc-500">{item.route.reason}</p>
        </div>
      )}

      {item.status === "replying" && <Pending label="Writing a reply" />}

      {item.reply && (
        <div className="flex gap-3 rounded-2xl bg-zinc-50 p-3">
          <Avatar dark={human}>
            {human ? <UserRound className="size-3.5" strokeWidth={1.75} /> : <Bot className="size-3.5" strokeWidth={1.75} />}
          </Avatar>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {human ? "Fixed message · handed to a person" : `${meta?.label} assistant`}
            </p>
            <p className="text-sm leading-6">{item.reply}</p>
          </div>
        </div>
      )}

      {item.error && <p className="ml-9 text-sm text-rose-600">{item.error}</p>}
    </article>
  );
}

function Avatar({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`grid size-6 shrink-0 place-items-center rounded-full ${dark ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-500"}`}>
      {children}
    </span>
  );
}

function Pending({ label }: { label: string }) {
  return (
    <p className="ml-9 flex items-center gap-2 text-xs text-zinc-400">
      <Loader2 className="size-3.5 animate-spin" /> {label}
    </p>
  );
}
