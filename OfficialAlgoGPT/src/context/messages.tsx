"use client";

import { createContext, ReactNode, useState } from "react";
import { Message } from "@/lib/validators/message";
import { useConversationHistory } from "@/lib/conversationHistory"; // Adjust path if needed

export const MessagesContext = createContext<{
  messages: Message[];
  isMessageUpdating: boolean;
  addMessage: (message: Message) => void;
  removeMessage: (id: string) => void;
  updateMessage: (id: string, updateFn: (prevText: string) => string) => void;
  setIsMessageUpdating: (isUpdating: boolean) => void;
  clearHistory: () => void;
}>({
  messages: [],
  isMessageUpdating: false,
  addMessage: () => {},
  removeMessage: () => {},
  updateMessage: () => {},
  setIsMessageUpdating: () => {},
  clearHistory: () => {},
});

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { history, addMessage, removeMessage, updateMessage, clearHistory } =
    useConversationHistory();
  const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false);

  return (
    <MessagesContext.Provider
      value={{
        messages: history,
        addMessage,
        removeMessage,
        updateMessage,
        isMessageUpdating,
        setIsMessageUpdating,
        clearHistory,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
