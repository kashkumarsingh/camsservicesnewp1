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
  variant?: "primary" | "default";
};

export type GeneralTopic = "packages" | "how" | "start" | "schools" | "other";

type EnquiryIntent = "general" | "referral" | "trainer" | "";

type IntakeData = {
  intent: EnquiryIntent;
  topic: GeneralTopic | "";
  name: string;
  email: string;
  message: string;
  phone: string;
};

type IntakeStep = "intent" | "topic" | "capture" | "redirect" | "submitting" | "done";

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

export const GENERAL_TOPICS: ReadonlyArray<{ id: GeneralTopic; label: string; message: string }> = [
  { id: "packages", label: "Packages & pricing", message: "I'd like to know about packages and pricing." },
  { id: "how", label: "How CAMS works", message: "I'd like to understand how CAMS works." },
  { id: "start", label: "Getting started", message: "I'd like to know about availability and getting started." },
  { id: "schools", label: "Schools & partners", message: "Enquiry from a school or partner organisation." },
  { id: "other", label: "Something else", message: "" },
];

const INITIAL_DATA: IntakeData = {
  intent: "",
  topic: "",
  name: "",
  email: "",
  message: "",
  phone: "",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi — how can we help you today?",
  },
];

const INTENT_LABELS: Record<Exclude<EnquiryIntent, "">, string> = {
  general: "General question",
  referral: "Refer a young person",
  trainer: "Become a trainer",
};

function createMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function topicLabel(topic: GeneralTopic): string {
  return GENERAL_TOPICS.find((item) => item.id === topic)?.label ?? "General question";
}

function intakeReducer(state: IntakeState, action: IntakeAction): IntakeState {
  switch (action.type) {
    case "ADD_ASSISTANT":
      return { ...state, messages: [...state.messages, createMessage("assistant", action.text)] };
    case "ADD_USER":
      return { ...state, messages: [...state.messages, createMessage("user", action.text)] };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "PATCH_DATA":
      return { ...state, data: { ...state.data, ...action.patch } };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET":
      return { step: "intent", data: INITIAL_DATA, messages: INITIAL_MESSAGES, error: null };
    default:
      return state;
  }
}

export function isValidEnquiryEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildSubmissionPayload(data: IntakeData): CreateContactSubmissionDTO {
  const topic = data.topic as GeneralTopic;
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim() || undefined,
    inquiryType: topic === "schools" ? "other" : topic === "packages" ? "package" : "general",
    inquiryDetails: `Topic: ${topicLabel(topic)}`,
    urgency: "exploring",
    preferredContact: data.phone.trim() ? "phone" : "email",
    message: data.message.trim() || GENERAL_TOPICS.find((item) => item.id === topic)?.message || "General enquiry",
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

    if (state.step === "topic") {
      return GENERAL_TOPICS.map((topic) => ({ id: topic.id, label: topic.label }));
    }

    if (state.step === "redirect") {
      if (state.data.intent === "trainer") {
        return [
          {
            id: "trainer-page",
            label: "Go to trainer application",
            href: ROUTES.BECOME_A_TRAINER,
            variant: "primary",
          },
        ];
      }
      if (state.data.intent === "referral") {
        return [
          {
            id: "referral-page",
            label: "Go to referral form",
            href: ROUTES.REFERRAL,
            variant: "primary",
          },
        ];
      }
    }

    if (state.step === "done") {
      return [{ id: "close", label: "Close", variant: "primary" }];
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
        text: "Trainer applications are handled on a dedicated page — takes about 10 minutes and goes straight to our recruitment team.",
      });
      return;
    }

    if (intent === "referral") {
      dispatch({ type: "SET_STEP", step: "redirect" });
      dispatch({
        type: "ADD_ASSISTANT",
        text: "Referrals need a few details about the young person. Our referral form is the quickest way — we aim to come back within one working day.",
      });
      return;
    }

    dispatch({ type: "SET_STEP", step: "topic" });
    dispatch({
      type: "ADD_ASSISTANT",
      text: "What would you like to know about?",
    });
  }, []);

  const handleTopicChoice = useCallback((topicId: GeneralTopic) => {
    const topic = GENERAL_TOPICS.find((item) => item.id === topicId);
    if (!topic) return;

    dispatch({ type: "ADD_USER", text: topic.label });
    dispatch({
      type: "PATCH_DATA",
      patch: {
        topic: topicId,
        message: topic.message,
      },
    });
    dispatch({ type: "SET_STEP", step: "capture" });
    dispatch({
      type: "ADD_ASSISTANT",
      text: "Pop your details below and we'll email you back — usually within one working day.",
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

      if (state.step === "topic") {
        handleTopicChoice(replyId as GeneralTopic);
      }
    },
    [handleIntentChoice, handleTopicChoice, state.step]
  );

  const submitCapture = useCallback(
    (fields: { name: string; email: string; phone: string; note: string }): CreateContactSubmissionDTO | null => {
      dispatch({ type: "SET_ERROR", error: null });

      const name = fields.name.trim();
      const email = fields.email.trim();
      const phone = fields.phone.trim();
      const note = fields.note.trim();

      if (name.length < 2) {
        dispatch({ type: "SET_ERROR", error: "Please add your name." });
        return null;
      }

      if (!isValidEnquiryEmail(email)) {
        dispatch({ type: "SET_ERROR", error: "Please check your email address." });
        return null;
      }

      const topic = state.data.topic as GeneralTopic;
      const baseMessage = GENERAL_TOPICS.find((item) => item.id === topic)?.message ?? "General enquiry";
      const message = topic === "other" && note ? note : baseMessage;

      const nextData: IntakeData = {
        ...state.data,
        name,
        email,
        phone,
        message,
      };

      dispatch({ type: "PATCH_DATA", patch: nextData });

      if (topic === "other" && note.length > 0 && note.length < 4) {
        dispatch({ type: "SET_ERROR", error: "Please add a little more detail, or leave the note blank." });
        return null;
      }

      return buildSubmissionPayload(nextData);
    },
    [state.data]
  );

  const markSubmitting = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "submitting" });
  }, []);

  const markDone = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "done" });
    dispatch({
      type: "ADD_ASSISTANT",
      text: "Thanks — we've got that. Someone from the team will be in touch by email soon.",
    });
  }, []);

  const markFailed = useCallback((message: string) => {
    dispatch({ type: "SET_STEP", step: "capture" });
    dispatch({ type: "SET_ERROR", error: message });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
    if (state.step === "capture") {
      dispatch({ type: "SET_STEP", step: "topic" });
      dispatch({ type: "PATCH_DATA", patch: { topic: "", message: "" } });
      return;
    }
    if (state.step === "topic") {
      dispatch({ type: "RESET" });
    }
  }, [state.step]);

  return {
    messages: state.messages,
    step: state.step,
    data: state.data,
    error: state.error,
    quickReplies,
    submitQuickReply,
    submitCapture,
    markSubmitting,
    markDone,
    markFailed,
    goBack,
    reset: () => dispatch({ type: "RESET" }),
  };
}
