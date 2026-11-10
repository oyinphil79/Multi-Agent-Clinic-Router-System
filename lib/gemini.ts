import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { EMERGENCY_REPLY, ROUTER_PROMPT, lanePrompt } from "./clinic";
import { applySafetyNet } from "./safety";
import { LANES, type Lane, type RouteResult } from "./types";
import type { ModelId } from "./models";

const ROUTE_SCHEMA = {
  type: "object",
  properties: {
    lane: { type: "string", enum: [...LANES] },
    reason: { type: "string", description: "One sentence on why this lane." },
  },
  required: ["lane", "reason"],
};

const thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };

export async function routeMessage(key: string, model: ModelId, message: string): Promise<RouteResult> {
  const ai = new GoogleGenAI({ apiKey: key });
  const res = await ai.models.generateContent({
    model,
    contents: message,
    config: {
      systemInstruction: ROUTER_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: ROUTE_SCHEMA,
      thinkingConfig,
    },
  });

  let lane: unknown;
  let reason = "";
  try {
    const parsed = JSON.parse(res.text ?? "");
    lane = parsed.lane;
    reason = String(parsed.reason ?? "").trim();
  } catch {
    lane = undefined;
  }
  return applySafetyNet(message, lane, reason);
}

export async function replyTo(key: string, model: ModelId, message: string, lane: Lane): Promise<string> {
  if (lane === "emergency") return EMERGENCY_REPLY; // a person takes over, no AI call

  const ai = new GoogleGenAI({ apiKey: key });
  const res = await ai.models.generateContent({
    model,
    contents: message,
    config: { systemInstruction: lanePrompt(lane), thinkingConfig },
  });
  const text = res.text?.trim();
  return text || "Thank you for your message. A member of our team will call you back shortly.";
}

// Turn SDK errors into short, key-free messages for the screen.
export function describeError(err: unknown): { status: number; message: string } {
  if (err instanceof ApiError) {
    if (err.status === 400 && /api key/i.test(err.message)) {
      return { status: 401, message: "Gemini rejected this API key. Check it and try again." };
    }
    if (err.status === 401 || err.status === 403) {
      return { status: 401, message: "Gemini rejected this API key. Check it and try again." };
    }
    if (err.status === 404) return { status: 404, message: "This model is not available for your key." };
    if (err.status === 429) return { status: 429, message: "Rate limit reached. Wait a moment and send again." };
    return { status: 502, message: `Gemini returned an error (${err.status}).` };
  }
  return { status: 500, message: "Something went wrong while calling Gemini." };
}
