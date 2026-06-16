import { RECEPTIONIST_SESSION_KEY } from "./receptionistConfig";

type N8nChatAction = "sendMessage" | "loadPreviousSession";

type N8nChatRequestBody = {
  chatInput?: string;
  sessionId: string;
  action?: N8nChatAction;
  metadata?: Record<string, string>;
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const existing = window.sessionStorage.getItem(RECEPTIONIST_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(RECEPTIONIST_SESSION_KEY, sessionId);
  return sessionId;
}

function extractAssistantReply(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = [record.output, record.text, record.message, record.reply, record.response];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (Array.isArray(record.data) && record.data.length > 0) {
    const first = record.data[0];
    if (typeof first === "string" && first.trim()) {
      return first.trim();
    }
    if (first && typeof first === "object") {
      return extractAssistantReply(first);
    }
  }

  return null;
}

async function postToN8n(webhookUrl: string, action: N8nChatAction, body: N8nChatRequestBody): Promise<string> {
  const url = new URL(webhookUrl);
  url.searchParams.set("action", action);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("The receptionist is temporarily unavailable. Please try again or use our contact form.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  const reply = extractAssistantReply(payload);

  if (!reply) {
    throw new Error("The receptionist returned an empty response. Please try again.");
  }

  return reply;
}

export async function loadN8nReceptionistSession(webhookUrl: string): Promise<string | null> {
  const sessionId = getOrCreateSessionId();

  try {
    return await postToN8n(webhookUrl, "loadPreviousSession", { sessionId });
  } catch {
    return null;
  }
}

export async function sendN8nReceptionistMessage(webhookUrl: string, message: string): Promise<string> {
  const sessionId = getOrCreateSessionId();
  return postToN8n(webhookUrl, "sendMessage", {
    sessionId,
    chatInput: message.trim(),
    metadata: {
      source: "cams-site-fab",
    },
  });
}
