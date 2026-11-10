# Clinic Receptionist

A small Next.js demo of a WhatsApp receptionist for a made-up clinic, Sunrise Family Clinic. Each message is **routed first**
(appointment, reports, billing or emergency), then answered by that lane's own assistant. Emergencies never get an AI
reply: the patient gets a fixed "call 112" message and the message lands in a human inbox.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, paste your Gemini API key, and click **Send to router**. The first batch is pre-filled.

## How it works

- `POST /api/chat` with `step: "route"` asks Gemini for structured JSON: one lane plus a one-sentence reason.
  A plain word list (`lib/safety.ts`, English, Hindi and Hinglish) runs after the model and can only escalate to emergency.
  An unknown lane is also treated as emergency.
- `step: "reply"` calls Gemini with the lane's own system prompt and facts (`lib/clinic.ts`). Emergency returns a fixed message, no AI call.
- Every call uses low thinking. Models: Gemini 3.8 Flash (default) and Gemini 3.5 Flash-Lite (cheaper), switchable top right.
- The API key lives in `sessionStorage`, travels as the `x-gemini-key` header, and is never stored or logged on the server.

## Files

- `app/page.tsx` – screen and the message loop
- `app/api/chat/route.ts` – the single backend route
- `components/` – header, key bar, setup card, thread, lanes, inbox
- `lib/` – Gemini calls, clinic facts and prompts, safety net, models, batches
