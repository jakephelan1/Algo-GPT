"use client";

import { useState, useEffect } from "react";
import { Message } from "@/lib/validators/message";
import { nanoid } from "nanoid";

export function useConversationHistory() {
  const [history, setHistory] = useState<Message[]>([]);

  // Load chat history from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("chatHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        // Initialize with a default message if there's no history
        const initialMessage: Message = {
          id: nanoid(),
          text: "Hello, how can I help you?",
          isUserMessage: false,
        };
        setHistory([initialMessage]);
        localStorage.setItem("chatHistory", JSON.stringify([initialMessage]));
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatHistory", JSON.stringify(history));
    }
  }, [history]);

  const addMessage = (message: Message) => {
    setHistory((prevHistory) => [...prevHistory, message]);
  };

  const removeMessage = (id: string) => {
    setHistory((prevHistory) => prevHistory.filter((msg) => msg.id !== id));
  };

  const updateMessage = (id: string, updateFn: (prevText: string) => string) => {
    setHistory((prevHistory) =>
      prevHistory.map((msg) =>
        msg.id === id ? { ...msg, text: updateFn(msg.text) } : msg
      )
    );
  };

  const clearHistory = () => {
    const initialMessage: Message = {
      id: nanoid(),
      text: "Hello, how can I help you?",
      isUserMessage: false,
    };
    setHistory([initialMessage]);
  };

  return {
    history,
    addMessage,
    removeMessage,
    updateMessage,
    clearHistory,
  };
}
