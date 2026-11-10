import { Check, Inbox as InboxIcon } from "lucide-react";
import type { ThreadItem } from "@/lib/types";

type Props = { items: ThreadItem[]; onHandled: (id: string) => void };

export function Inbox({ items, onHandled }: Props) {
  const open = items.filter((i) => !i.handled).length;
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="mb-3 flex items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          <InboxIcon className="size-4 text-zinc-400" strokeWidth={1.75} />
          Human inbox
        </span>
        {open > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] text-white">{open} open</span>}
      </h2>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-zinc-50/60 p-4 text-center text-xs text-zinc-400">No urgent messages yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl p-3 ring-1 transition ${item.handled ? "bg-zinc-50/60 ring-black/5" : "bg-rose-50/60 ring-rose-200"}`}
            >
              <p className={`text-sm leading-5 ${item.handled ? "text-zinc-400 line-through" : ""}`}>{item.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-400">
                  {item.route?.at}
                  {item.route?.safetyNet ? " · safety net" : ""}
                </span>
                {item.handled ? (
                  <span className="flex items-center gap-1 text-xs text-zinc-400"><Check className="size-3.5" /> Handled</span>
                ) : (
                  <button
                    onClick={() => onHandled(item.id)}
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    Mark handled
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
