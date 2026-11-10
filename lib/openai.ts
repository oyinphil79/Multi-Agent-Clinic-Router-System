import OpenAI, { APIError } from "openai";
import { EMERGENCY_REPLY, ROUTER_PROMPT, lanePrompt } from "./clinic";
import { applySafetyNet } from "./safety";
import { LANES, type Lane, type RouteResult } from "./types";
import type { ModelId } from "./models";

const ROUTE_FORMAT = {
  type: "json_schema" as const,
  name: "route",
  strict: true,
  schema: {
    type: "object",
    properties: {
      lane: { type: "string", enum: [...LANES] },
      reason: { type: "string", description: "One sentence on why this lane." },
    },
    required: ["lane", "reason"],
    additionalProperties: false,
  },
};

const reasoning = { effort: "low" as const };

// A fresh client per request: the key is used once and never kept.
const client = (key: string) => new OpenAI({ apiKey: key, maxRetries: 1 });

export async function routeMessage(key: string, model: ModelId, message: string): Promise<RouteResult> {
  const res = await client(key).responses.create({
    model,
    instructions: ROUTER_PROMPT,
    input: message,
    reasoning,
    text: { format: ROUTE_FORMAT },
    store: false,
  });

  let lane: unknown;
  let reason = "";
  try {
    const parsed = JSON.parse(res.output_text);
    lane = parsed.lane;
    reason = String(parsed.reason ?? "").trim();
  } catch {
    lane = undefined;
  }
  return applySafetyNet(message, lane, reason);
}

export async function replyTo(key: string, model: ModelId, message: string, lane: Lane): Promise<string> {
  if (lane === "emergency") return EMERGENCY_REPLY; // a person takes over, no AI call

  const res = await client(key).responses.create({
    model,
    instructions: lanePrompt(lane),
    input: message,
    reasoning,
    store: false,
  });
  const text = res.output_text?.trim();
  return text || "Thank you for your message. A member of our team will call you back shortly.";
}

// Turn SDK errors into short, key-free messages for the screen.
export function describeError(err: unknown): { status: number; message: string } {
  if (err instanceof APIError) {
    if (err.status === undefined) return { status: 502, message: "Could not reach OpenAI. Check your connection and try again." };
    if (err.status === 401 || err.status === 403) {
      return { status: 401, message: "OpenAI rejected this API key. Check it and try again." };
    }
    if (err.status === 404) return { status: 404, message: "This model is not available for your key." };
    if (err.status === 429) return { status: 429, message: "Rate limit or quota reached. Wait a moment and send again." };
    return { status: 502, message: `OpenAI returned an error (${err.status}).` };
  }
  return { status: 500, message: "Something went wrong while calling OpenAI." };
}
