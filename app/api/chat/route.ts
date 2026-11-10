import { NextResponse } from "next/server";
import { describeError, replyTo, routeMessage } from "@/lib/gemini";
import { isModelId } from "@/lib/models";
import { LANES, type Lane } from "@/lib/types";

export const runtime = "nodejs";

// One route, two steps: "route" sorts the message, "reply" answers it.
// The key arrives in a header, is used for this request only, and is never stored or logged.
export async function POST(req: Request) {
  const key = req.headers.get("x-gemini-key")?.trim();
  if (!key) return NextResponse.json({ error: "Add your Gemini API key first." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
  if (!message) return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  if (!isModelId(body?.model)) return NextResponse.json({ error: "Unknown model." }, { status: 400 });

  const started = Date.now();
  try {
    if (body.step === "route") {
      const result = await routeMessage(key, body.model, message);
      return NextResponse.json({ ...result, ms: Date.now() - started });
    }
    if (body.step === "reply") {
      const lane: Lane = LANES.includes(body.lane) ? body.lane : "emergency";
      const reply = await replyTo(key, body.model, message, lane);
      return NextResponse.json({ reply, ms: Date.now() - started });
    }
    return NextResponse.json({ error: "Unknown step." }, { status: 400 });
  } catch (err) {
    const { status, message: error } = describeError(err);
    return NextResponse.json({ error }, { status });
  }
}
