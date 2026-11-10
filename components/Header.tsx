import { Stethoscope } from "lucide-react";
import { MODELS, type ModelId } from "@/lib/models";

type Props = { model: ModelId; onModel: (m: ModelId) => void; disabled: boolean };

export function Header({ model, onModel, disabled }: Props) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-zinc-900 text-white">
          <Stethoscope className="size-4" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-medium tracking-tight">Clinic Receptionist</span>
      </div>
      <div role="radiogroup" aria-label="Model" className="flex rounded-full bg-white p-1 ring-1 ring-black/5">
        {MODELS.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={model === m.id}
            disabled={disabled}
            onClick={() => onModel(m.id)}
            title={`${m.id} · ${m.note}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${
              model === m.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
