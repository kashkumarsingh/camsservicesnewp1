"use client";

import { useCallback, useMemo, useReducer } from "react";
import { ROUTES } from "@/shared/utils/routes";
import type { CreateContactSubmissionDTO } from "@/core/application/contact";

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export type QuickReply = {
  id: string;
  label: string;
  href?: string;
};

type EnquiryIntent = "general" | "referral" | "trainer" | "";

type IntakeData = {
  intent: EnquiryIntent;
  name: string;
  email: string;
  message: string;
  phone: string;
};

type IntakeStep =
  | "intent"
  | "name"
  | "email"
  | "message"
  | "phone"
  | "confirm"
  | "submitting"
  | "done"
  | "redirect";

type IntakeState = {
  step: IntakeStep;
  data: IntakeData;
  messages: ChatMessage[];
  error: string | null;
};

type IntakeAction =
  | { type: "ADD_ASSISTANT"; text: string }
  | { type: "ADD_USER"; text: string }
  | { type: "SET_STEP"; step: IntakeStep }
  | { type: "PATCH_DATA"; patch: Partial<IntakeData> }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const INITIAL_DATA: IntakeData = {
  intent: "",
  name: "",
  email: "",
  message: "",
  phone: "",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    text: "Hi — thanks for getting in touch with CAMS.",
  },
  {
    id: "welcome-2",
    role: "assistant",
    text: "What can we help you with today?",
  },
];

const INTENT_LABELS: Record<Exclude<EnquiryIntent, "">, string> = {
  general: "A general question",
  referral: "Refer a young person",
  trainer: "Apply to become a trainer",
};

function createMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? "there";
}

function intakeReducer(state: IntakeState, action: IntakeAction): IntakeState {
  switch (action.type) {
    case "ADD_ASSISTANT":
      return {
        ...state,
        messages: [...state.messages, createMessage("assistant", action.text)],
      };
    case "ADD_USER":
      return {
        ...state,
        messages: [...state.messages, createMessage("user", action.text)],
      };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "PATCH_DATA":
      return { ...state, data: { ...state.data, ...action.patch } };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET":
      return {
        step: "intent",
        data: INITIAL_DATA,
        messages: INITIAL_MESSAGES,
        error: null,
      };
    default:
      return state;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildSubmissionPayload(data: IntakeData): CreateContactSubmissionDTO {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim() || undefined,
    inquiryType: "general",
    inquiryDetails: "General enquiry via site chat",
    urgency: "exploring",
    preferredContact: data.phone.trim() ? "phone" : "email",
    message: data.message.trim(),
    newsletter: false,
    sourcePage: "receptionist-fab",
  };
}

export function useGuidedIntakeChat() {
  const [state, dispatch] = useReducer(intakeReducer, {
    step: "intent",
    data: INITIAL_DATA,
    messages: INITIAL_MESSAGES,
    error: null,
  });

  const quickReplies = useMemo((): readonly QuickReply[] => {
    if (state.step === "intent") {
      return [
        { id: "general", label: "General question" },
        { id: "referral", label: "Refer a young person" },
        { id: "trainer", label: "Become a trainer" },
      ];
    }

    if (state.step === "redirect") {
      if (state.data.intent === "trainer") {
        return [{ id: "trainer-page", label: "Open trainer application", href: ROUTES.BECOME_A_TRAINER }];
      }
      if (state.data.intent === "referral") {
        return [{ id: "referral-page", label: "Open referral form", href: ROUTES.REFERRAL }];
      }
    }

    if (state.step === "phone") {
      return [{ id: "skip", label: "Skip for now" }];
    }

    if (state.step === "confirm") {
      return [
        { id: "send", label: "Yes, send it" },
        { id: "edit", label: "Start again" },
      ];
    }

    return [];
  }, [state.data.intent, state.step]);

  const handleIntentChoice = useCallback((intent: Exclude<EnquiryIntent, "">) => {
    dispatch({ type: "ADD_USER", text: INTENT_LABELS[intent] });
    dispatch({ type: "PATCH_DATA", patch: { intent } });

    if (intent === "trainer") {
      dispatch({ type: "SET_STEP", step: "redirect" });
      dispatch({
        type: "ADD_ASSISTANT",
        text: "Lovely — mentor applications go through a short form on our website (about 10 minutes). That way we get the details our recruitment team needs.",
      });
      dispatch({
        type: "ADD_ASSISTANT",
        text: "Tap below when you're ready and we'll take you there.",
      });
      return;
    }

    if (intent === "referral") {
      dispatch({ type: "SET_STEP", step: "redirect" });
      dispatch({
        type: "ADD_ASSISTANT",
        text: "For referrals we use a dedicated form so we can capture the young person's needs properly and come back to you within one working day.",
      });
      dispatch({
        type: "ADD_ASSISTANT",
        text: "Tap below to open the referral form — it only takes a few minutes.",
      });
      return;
    }

    dispatch({ type: "SET_STEP", step: "name" });
    dispatch({
      type: "ADD_ASSISTANT",
      text: "No problem — I'll pass this to the team. What's your name?",
    });
  }, []);

  const submitQuickReply = useCallback(
    (replyId: string) => {
      if (state.step === "intent") {
        if (replyId === "general" || replyId === "referral" || replyId === "trainer") {
          handleIntentChoice(replyId);
        }
        return;
      }

      if (state.step === "phone" && replyId === "skip") {
        dispatch({ type: "ADD_USER", text: "Skip for now" });
        dispatch({ type: "SET_STEP", step: "confirm" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: `Thanks, ${firstName(state.data.name)}. Shall I send this through to the team?`,
        });
        return;
      }

      if (state.step === "confirm" && replyId === "edit") {
        dispatch({ type: "RESET" });
      }
    },
    [handleIntentChoice, state.data.name, state.step]
  );

  const submitText = useCallback(
    (rawInput: string): CreateContactSubmissionDTO | null => {
      const input = rawInput.trim();
      if (!input || state.step === "submitting" || state.step === "done" || state.step === "redirect") {
        return null;
      }

      dispatch({ type: "SET_ERROR", error: null });
      dispatch({ type: "ADD_USER", text: input });

      if (state.step === "name") {
        if (input.length < 2) {
          dispatch({ type: "SET_ERROR", error: "Please pop in your name so we know who to reply to." });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { name: input } });
        dispatch({ type: "SET_STEP", step: "email" });
        dispatch({ type: "ADD_ASSISTANT", text: "And the best email to reach you on?" });
        return null;
      }

      if (state.step === "email") {
        if (!isValidEmail(input)) {
          dispatch({ type: "SET_ERROR", error: "That email doesn't look quite right — could you check it?" });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { email: input } });
        dispatch({ type: "SET_STEP", step: "message" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: "What would you like to ask? Packages, how we work, availability — whatever's on your mind.",
        });
        return null;
      }

      if (state.step === "message") {
        if (input.length < 8) {
          dispatch({ type: "SET_ERROR", error: "A little more detail helps us point you to the right person." });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { message: input } });
        dispatch({ type: "SET_STEP", step: "phone" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: "Want to leave a phone number in case we need to call? You can skip this if you'd rather email only.",
        });
        return null;
      }

      if (state.step === "phone") {
        dispatch({ type: "PATCH_DATA", patch: { phone: input } });
        dispatch({ type: "SET_STEP", step: "confirm" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: `Thanks, ${firstName(state.data.name)}. Shall I send this through to the team?`,
        });
        return null;
      }

      return null;
    },
    [state.data.name, state.step]
  );

  const buildSubmission = useCallback((): CreateContactSubmissionDTO | null => {
    if (state.step !== "confirm" || state.data.intent !== "general") {
      return null;
    }

    if (!state.data.name || !state.data.email || !state.data.message) {
      dispatch({ type: "SET_ERROR", error: "Something's missing — tap Start again and we'll run through it." });
      return null;
    }

    return buildSubmissionPayload(state.data);
  }, [state.data, state.step]);

  const markSubmitting = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "submitting" });
  }, []);

  const markDone = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "done" });
    dispatch({
      type: "ADD_ASSISTANT",
      text: "Done — we've got your message. Someone from the team will email you back within one working day (Mon–Fri).",
    });
  }, []);

  const markFailed = useCallback((message: string) => {
    dispatch({ type: "SET_STEP", step: "confirm" });
    dispatch({ type: "SET_ERROR", error: message });
  }, []);

  return {
    messages: state.messages,
    step: state.step,
    error: state.error,
    quickReplies,
    submitText,
    submitQuickReply,
    buildSubmission,
    markSubmitting,
    markDone,
    markFailed,
    reset: () => dispatch({ type: "RESET" }),
  };
}
