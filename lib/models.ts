export const MODELS = [
  { id: "gemini-3.8-flash", label: "3.8 Flash", note: "Default" },
  { id: "gemini-3.5-flash-lite", label: "3.5 Flash-Lite", note: "Cheaper" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = MODELS[0].id;

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((m) => m.id === value);
}
