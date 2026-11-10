export const MODELS = [
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", note: "Default" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 nano", note: "Cheaper" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = MODELS[0].id;

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((m) => m.id === value);
}
