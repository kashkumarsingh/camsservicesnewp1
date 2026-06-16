"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { CreateContactSubmissionDTO } from "@/core/application/contact";

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type AudienceOption = "parent" | "school" | "partner" | "other";

type IntakeData = {
  name: string;
  email: string;
  audience: AudienceOption | "";
  message: string;
  phone: string;
};

type IntakeStep =
  | "welcome"
  | "name"
  | "email"
  | "audience"
  | "message"
  | "phone"
  | "confirm"
  | "submitting"
  | "done";

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
  name: "",
  email: "",
  audience: "",
  message: "",
  phone: "",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    text: "Hello — I'm the CAMS Services receptionist.",
  },
  {
    id: "welcome-2",
    role: "assistant",
    text: "I'll collect a few details so our team can reply by email. What is your full name?",
  },
];

function createMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
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
        step: "name",
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

function audienceLabel(value: AudienceOption): string {
  switch (value) {
    case "parent":
      return "Parent or carer";
    case "school":
      return "School or setting";
    case "partner":
      return "Partner professional";
    default:
      return "Other";
  }
}

function mapAudienceToInquiryType(audience: AudienceOption): CreateContactSubmissionDTO["inquiryType"] {
  if (audience === "school") return "service";
  if (audience === "partner") return "other";
  return "general";
}

function buildSubmissionPayload(data: IntakeData): CreateContactSubmissionDTO {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim() || undefined,
    inquiryType: mapAudienceToInquiryType(data.audience as AudienceOption),
    inquiryDetails: `Audience: ${audienceLabel(data.audience as AudienceOption)}`,
    urgency: "exploring",
    preferredContact: data.phone.trim() ? "phone" : "email",
    message: data.message.trim(),
    newsletter: false,
    sourcePage: "receptionist-fab",
  };
}

export function useGuidedIntakeChat() {
  const [state, dispatch] = useReducer(intakeReducer, {
    step: "name",
    data: INITIAL_DATA,
    messages: INITIAL_MESSAGES,
    error: null,
  });

  const quickReplies = useMemo(() => {
    if (state.step === "audience") {
      return [
        { id: "parent", label: "Parent or carer" },
        { id: "school", label: "School or setting" },
        { id: "partner", label: "Partner professional" },
        { id: "other", label: "Other" },
      ] as const;
    }

    if (state.step === "phone") {
      return [{ id: "skip", label: "Skip for now" }] as const;
    }

    if (state.step === "confirm") {
      return [
        { id: "send", label: "Send to CAMS" },
        { id: "edit", label: "Start again" },
      ] as const;
    }

    return [] as const;
  }, [state.step]);

  const submitQuickReply = useCallback(
    (replyId: string) => {
      if (state.step === "audience") {
        const audience = replyId as AudienceOption;
        dispatch({ type: "ADD_USER", text: audienceLabel(audience) });
        dispatch({ type: "PATCH_DATA", patch: { audience } });
        dispatch({ type: "SET_STEP", step: "message" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: "Thank you. In a sentence or two, what support are you looking for?",
        });
        return;
      }

      if (state.step === "phone" && replyId === "skip") {
        dispatch({ type: "ADD_USER", text: "Skip for now" });
        dispatch({ type: "SET_STEP", step: "confirm" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: `Thanks, ${state.data.name.split(" ")[0]}. I'll send this to our team at hello@camsservices.co.uk. Ready to submit?`,
        });
        return;
      }

      if (state.step === "confirm" && replyId === "edit") {
        dispatch({ type: "RESET" });
        return;
      }
    },
    [state.data.name, state.step]
  );

  const submitText = useCallback(
    (rawInput: string): CreateContactSubmissionDTO | null => {
      const input = rawInput.trim();
      if (!input || state.step === "submitting" || state.step === "done") {
        return null;
      }

      dispatch({ type: "SET_ERROR", error: null });
      dispatch({ type: "ADD_USER", text: input });

      if (state.step === "name") {
        if (input.length < 2) {
          dispatch({ type: "SET_ERROR", error: "Please enter your full name." });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { name: input } });
        dispatch({ type: "SET_STEP", step: "email" });
        dispatch({ type: "ADD_ASSISTANT", text: "What email should we reply to?" });
        return null;
      }

      if (state.step === "email") {
        if (!isValidEmail(input)) {
          dispatch({ type: "SET_ERROR", error: "Please enter a valid email address." });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { email: input } });
        dispatch({ type: "SET_STEP", step: "audience" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: "Who is this enquiry for?",
        });
        return null;
      }

      if (state.step === "message") {
        if (input.length < 8) {
          dispatch({ type: "SET_ERROR", error: "Please share a little more detail so we can help." });
          return null;
        }
        dispatch({ type: "PATCH_DATA", patch: { message: input } });
        dispatch({ type: "SET_STEP", step: "phone" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: "Optional: add a phone number if you'd like a call back. Or tap Skip for now.",
        });
        return null;
      }

      if (state.step === "phone") {
        dispatch({ type: "PATCH_DATA", patch: { phone: input } });
        dispatch({ type: "SET_STEP", step: "confirm" });
        dispatch({
          type: "ADD_ASSISTANT",
          text: `Thanks, ${state.data.name.split(" ")[0]}. I'll send this to our team. Ready to submit?`,
        });
        return null;
      }

      return null;
    },
    [state.step]
  );

  const buildSubmission = useCallback((): CreateContactSubmissionDTO | null => {
    if (state.step !== "confirm") {
      return null;
    }

    if (!state.data.name || !state.data.email || !state.data.audience || !state.data.message) {
      dispatch({ type: "SET_ERROR", error: "Some details are missing. Please start again." });
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
      text: "Thank you — your enquiry has been sent. We aim to reply within one working day.",
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
