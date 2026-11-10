export const LANES = ["appointment", "reports", "billing", "emergency"] as const;
export type Lane = (typeof LANES)[number];

export type RouteResult = {
  lane: Lane;
  reason: string;
  safetyNet: boolean;
};

export type ReplyResult = { reply: string };

export type ChatRequest =
  | { step: "route"; model: string; message: string }
  | { step: "reply"; model: string; message: string; lane: Lane };

export type ItemStatus = "queued" | "routing" | "replying" | "done" | "error";

export type ThreadItem = {
  id: string;
  message: string;
  status: ItemStatus;
  route?: RouteResult & { at: string; ms: number };
  reply?: string;
  error?: string;
  handled?: boolean;
};
