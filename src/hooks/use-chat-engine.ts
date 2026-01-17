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

  // THE BRAIN: Stores the clean name of the last event (e.g., "Robowars")
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
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm Spark. Ask me about any TechSolstice event, or check the schedule!",
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // 1. UI Update (Show exactly what user typed)
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. SEND TO BACKEND
      // We pass the "activeContext" separately. We do NOT modify the message string.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId.current,
          activeContext: activeContext.current, // <--- THE MEMORY
          conversationHistory: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Network error");

      // 3. UPDATE MEMORY
      // The backend decides if the context changed. 
      if (data.context) {
        activeContext.current = data.context;
        console.log("Memory Updated:", activeContext.current);
      }

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