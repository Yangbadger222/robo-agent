import { create } from "zustand";
import type { StepId } from "./pipelineStore";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messagesByStep: Record<string, ChatMessage[]>;
  streamingContent: string;
  isStreaming: boolean;

  addMessage: (step: StepId, message: ChatMessage) => void;
  setMessages: (step: StepId, messages: ChatMessage[]) => void;
  getMessages: (step: StepId) => ChatMessage[];
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  clearStreaming: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByStep: {},
  streamingContent: "",
  isStreaming: false,

  addMessage: (step, message) =>
    set((state) => ({
      messagesByStep: {
        ...state.messagesByStep,
        [step]: [...(state.messagesByStep[step] || []), message],
      },
    })),

  setMessages: (step, messages) =>
    set((state) => ({
      messagesByStep: { ...state.messagesByStep, [step]: messages },
    })),

  getMessages: (step) => get().messagesByStep[step] || [],

  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  clearStreaming: () => set({ streamingContent: "" }),
}));
