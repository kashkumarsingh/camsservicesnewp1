export const RECEPTIONIST_SESSION_KEY = "cams_receptionist_session_v1";

export function getN8nChatWebhookUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL?.trim();
  return url ? url : null;
}

export function isN8nReceptionistEnabled(): boolean {
  return getN8nChatWebhookUrl() !== null;
}

export const RECEPTIONIST_INITIAL_MESSAGES = ["Hi — how can we help you today?"] as const;
