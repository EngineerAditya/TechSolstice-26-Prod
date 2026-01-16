import { useState, useCallback, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useChatEngine() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef("");

  // THE BRAIN: Stores the last event discussed (e.g., "Robowars")
  const activeContext = useRef<string | null>(null);

  useEffect(() => {
    // 1. Init Session
    if (typeof window !== "undefined") {
      let stored = sessionStorage.getItem("chat_session_id");
      if (!stored) {
        stored = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("chat_session_id", stored);
      }
      sessionId.current = stored;
    }

    // 2. Welcome Message
    // Check if we already have messages to avoid double-welcoming on re-renders
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm Spark. Ask me about any TechSolstice event, or check the schedule!",
        timestamp: new Date()
      }]);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Helper: Extract Event Name from Bot Response
  // Our formatter wraps names in **Name**, so we look for that pattern.
  const updateContextFromResponse = (response: string) => {
    // Regex: Matches **Event Name**
    const match = response.match(/\*\*(.*?)\*\*/);
    if (match && match[1]) {
      // Don't capture "Date", "Time", "Venue" etc if they happen to be bolded
      // Simple heuristic: Event names are usually the first bolded thing or we rely on the specific format
      // Since our formatter starts with "**EventName** is...", this works well.
      const candidate = match[1];
      if (!['Date', 'Time', 'Venue', 'Prize', 'Team'].includes(candidate)) {
        activeContext.current = candidate;
        console.log("Context Locked:", candidate); // Debugging
      }
    }
  };

  // Helper: Check if query needs context
  const needsContext = (query: string): boolean => {
    const lower = query.toLowerCase();
    const triggers = ['when', 'where', 'time', 'venue', 'cost', 'prize', 'rules', 'team', 'it', 'details', 'about'];

    // It needs context if:
    // 1. It's short (< 8 words)
    // 2. It contains a trigger word
    // 3. It DOESN'T look like a new search (doesn't contain "next", "all", "show")
    const isShort = query.split(' ').length < 8;
    const hasTrigger = triggers.some(t => lower.includes(t));
    const isNewIntent = /\b(next|all|show|list)\b/.test(lower);

    return isShort && hasTrigger && !isNewIntent;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // 1. Update UI immediately (Show raw user input)
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. CONTEXT INJECTION
      // If we have a locked context and the query is ambiguous, inject the context.
      let payloadMessage = content;
      if (activeContext.current && needsContext(content)) {
        payloadMessage = `${content} ${activeContext.current}`; // "Where is it?" -> "Where is it? Robowars"
      }

      // 3. Send Request
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payloadMessage, // Send enriched message
          sessionId: sessionId.current,
          // Optimization: Only send last 4 messages to save bandwidth
          conversationHistory: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Network error");

      // 4. Update Context based on new reply
      updateContextFromResponse(data.response);

      const botMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  return { isOpen, setIsOpen, messages, isLoading, sendMessage };
}