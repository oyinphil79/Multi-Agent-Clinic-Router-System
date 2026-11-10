import { LANES, type Lane, type RouteResult } from "./types";

// A plain, boring word list. It runs after the model and can only escalate.
const URGENT_TERMS = [
  // English
  "chest pain", "heart attack", "can't breathe", "cannot breathe", "cant breathe",
  "not breathing", "difficulty breathing", "short of breath", "unconscious", "fainted",
  "passed out", "seizure", "having a fit", "stroke", "heavy bleeding", "bleeding a lot",
  "won't stop bleeding", "poison", "overdose", "suicide", "kill myself",
  // Hinglish
  "saans nahi", "sans nahi", "saans lene mein", "seene mein dard", "sine me dard",
  "chhati mein dard", "khoon beh", "khoon nikal", "behosh", "daura", "zeher",
  "mar jaunga", "marna chahta",
  // Hindi
  "सांस नहीं", "साँस नहीं", "सीने में दर्द", "छाती में दर्द", "खून बह", "बेहोश", "दौरा", "ज़हर", "जहर",
];

function normalise(text: string): string {
  return text.toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ");
}

export function findUrgentTerm(message: string): string | null {
  const text = normalise(message);
  return URGENT_TERMS.find((term) => text.includes(term)) ?? null;
}

export function applySafetyNet(message: string, lane: unknown, reason: string): RouteResult {
  if (!LANES.includes(lane as Lane)) {
    return {
      lane: "emergency",
      reason: "The router gave an unclear answer, so a person will check it to be safe.",
      safetyNet: true,
    };
  }
  const term = findUrgentTerm(message);
  if (term && lane !== "emergency") {
    return {
      lane: "emergency",
      reason: `Matched the urgent phrase "${term}" (router had said ${lane}).`,
      safetyNet: true,
    };
  }
  return { lane: lane as Lane, reason, safetyNet: false };
}
