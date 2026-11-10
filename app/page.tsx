"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { KeyBar } from "@/components/KeyBar";
import { SetupCard } from "@/components/SetupCard";
import { Thread } from "@/components/Thread";
import { Lanes } from "@/components/Lanes";
import { Inbox } from "@/components/Inbox";
import { BATCHES, MAX_MESSAGES } from "@/lib/batches";
import { CLINIC } from "@/lib/clinic";
import { DEFAULT_MODEL, type ModelId } from "@/lib/models";
import { LANES, type Lane, type ThreadItem } from "@/lib/types";

const KEY_STORAGE = "gemini-key";

class ChatError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function callChat<T>(key: string, body: object): Promise<T> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-gemini-key": key },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ChatError(data.error ?? `Request failed (${res.status}).`, res.status);
  return data as T;
}

const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function Page() {
  const [key, setKey] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [preset, setPreset] = useState<string | null>(BATCHES[0].id);
  const [text, setText] = useState(BATCHES[0].messages.join("\n"));
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem(KEY_STORAGE) ?? "");
    } catch {}
  }, []);

  function updateKey(value: string) {
    setKey(value);
    setKeyError(null);
    try {
      if (value) sessionStorage.setItem(KEY_STORAGE, value);
      else sessionStorage.removeItem(KEY_STORAGE);
    } catch {}
  }

  function pickPreset(id: string) {
    const batch = BATCHES.find((b) => b.id === id);
    if (!batch) return;
    setPreset(id);
    setText(batch.messages.join("\n"));
  }

  const patch = (id: string, change: Partial<ThreadItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...change } : i)));

  async function send() {
    const apiKey = key.trim();
    if (!apiKey) {
      setKeyError("Paste your Gemini API key above to start. It is needed for every message.");
      return;
    }
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, MAX_MESSAGES);
    if (!lines.length) return;

    const batch: ThreadItem[] = lines.map((message, n) => ({ id: `${Date.now()}-${n}`, message, status: "queued" }));
    setItems(batch);
    setRunning(true);

    for (let n = 0; n < batch.length; n++) {
      const { id, message } = batch[n];
      try {
        patch(id, { status: "routing" });
        const route = await callChat<{ lane: Lane; reason: string; safetyNet: boolean; ms: number }>(apiKey, {
          step: "route",
          model,
          message,
        });
        patch(id, { status: "replying", route: { ...route, at: clock() } });
        const { reply } = await callChat<{ reply: string }>(apiKey, { step: "reply", model, message, lane: route.lane });
        patch(id, { status: "done", reply });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Something went wrong.";
        if (err instanceof ChatError && err.status === 401) setKeyError(error);
        patch(id, { status: "error", error });
        for (const rest of batch.slice(n + 1)) patch(rest.id, { status: "error", error: "Not sent, stopped after the error above." });
        break;
      }
    }
    setRunning(false);
  }

  const routed = items.filter((i) => i.route);
  const counts = Object.fromEntries(LANES.map((l) => [l, 0])) as Record<Lane, number>;
  for (const i of routed) counts[i.route!.lane]++;
  const latest = routed.at(-1)?.route?.lane ?? null;
  const emergencies = routed.filter((i) => i.route!.lane === "emergency");

  return (
    <div className="glow min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Header model={model} onModel={setModel} disabled={running} />

        <section className="py-12 text-center sm:py-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-zinc-500 ring-1 ring-black/5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {CLINIC.name} · WhatsApp line
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Every message is sorted first. Urgent ones go to a person.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            A router reads each patient message and picks a lane. Bookings, reports and billing get a short reply from that
            lane&apos;s assistant. Emergencies skip the bot entirely.
          </p>
          <p className="mt-6 text-sm text-zinc-500">
            <span className="text-2xl font-semibold tabular-nums text-zinc-900">{emergencies.length}</span>
            <span className="ml-2">of {routed.length} messages handed to a person</span>
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <KeyBar value={key} onChange={updateKey} error={keyError} />
            <SetupCard
              text={text}
              onText={(v) => {
                setText(v);
                setPreset(null);
              }}
              preset={preset}
              onPreset={pickPreset}
              onSend={send}
              running={running}
            />
            <Thread items={items} />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Lanes counts={counts} latest={latest} />
            <Inbox items={emergencies} onHandled={(id) => patch(id, { handled: true })} />
          </aside>
        </div>
      </div>
    </div>
  );
}
