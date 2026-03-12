"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSSE } from "@/hooks/useSSE";
import type { StepId } from "@/stores/pipelineStore";
import { cn } from "@/lib/utils";

interface StepChatPanelProps {
  stepId: StepId;
}

export function StepChatPanel({ stepId }: StepChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getMessages, isStreaming, streamingContent } = useChatStore();
  const { sendMessage } = useSSE(stepId);
  const messages = getMessages(stepId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">AI Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center text-muted-foreground text-sm mt-8">
            Ask the AI to help with this step, or click a button on the left to auto-generate.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-lg px-4 py-3 text-sm",
              msg.role === "user"
                ? "bg-primary/10 ml-8"
                : "bg-muted mr-8"
            )}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                {msg.content}
              </ReactMarkdown>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="bg-muted rounded-lg px-4 py-3 text-sm mr-8">
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
              {streamingContent}
            </ReactMarkdown>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI assistant..."
            disabled={isStreaming}
            className="flex-1 bg-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
