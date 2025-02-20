"use client";

import { MessagesContext } from '@/context/messages';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/validators/message';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { FC, HTMLAttributes, useContext, useRef, useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-hot-toast';
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { AILeetCodeMatcher } from '@/lib/ai-matcher';
import { xmlData } from '../helpers/constants/xmlData';

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {
  onShowRightPanel: () => void;
  setSlides: (slides: string[] | ((prevSlides: string[]) => string[])) => void; // ✅ Correct Typing
  disabled?: boolean;
  slideContext?: string | null;
}

const ChatInput: FC<ChatInputProps> = ({ className, onShowRightPanel, setSlides, disabled, slideContext, ...props }) => {
  const [input, setInput] = useState<string>('');
  const {
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext);
  const [matcher, setMatcher] = useState<AILeetCodeMatcher | null>(null);

  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setMatcher(new AILeetCodeMatcher(xmlData));
    } catch (error) {
      console.error("Error initializing matcher", error);
    }
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_slides");
      if (!response.ok) throw new Error("Failed to fetch slides");
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
  
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          if (chunkValue.includes("DONE")) {
            break
          }
          if (chunkValue.trim()) {
            try {
              // Parse each slide chunk and append it
              const slideChunks = chunkValue.split('\n')
                .filter(chunk => chunk.trim())
                .map(chunk => {
                  try {
                    return JSON.parse(chunk).slide;
                  } catch (e) {
                    console.error("Error parsing slide chunk:", e);
                    return null;
                  }
                })
                .filter(Boolean);
  
              setSlides(prevSlides => [...prevSlides, ...slideChunks]);
            } catch (e) {
              console.error("Error processing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: Message) => {
      if (!matcher) throw new Error("Matcher not initialized");

      const problemNumber = await matcher.findRelevantProblem(message.text);
      
      let solution = null;
      if (problemNumber !== 0) {
        const solnResponse = await fetch('http://127.0.0.1:5000/get_solution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemNumber }),
        });
  
        if (!solnResponse.ok) {
          throw new Error("Failed to fetch solution");
        }
  
        const { solution: fetchedSolution } = await solnResponse.json(); 
        solution = fetchedSolution;
  
        // ✅ Start streaming slides in background
        fetchSlides();
      } 

      const userQuery = message.text;
      const formattedMessage = { id: message.id, isUserMessage: message.isUserMessage, text: userQuery };

      console.log("Sending message:", JSON.stringify({ messages: [formattedMessage] }, null, 2));
      
      let desc = null;
      if (problemNumber != 0) {
        desc = matcher.getProblemDescription(problemNumber);
      } 


      // ✅ Send solution & description to chatbot API
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [formattedMessage], id: problemNumber, solution: solution, desc: desc, slideContext: slideContext || null }),
      });

      if (!response.ok) throw new Error("Error fetching chatbot response");
      if (!response.body) throw new Error("Response has no body");

      return response.body;
    },

    onMutate(message) {
      addMessage(message);
    },
    onSuccess: async (stream) => {
      if (!stream) throw new Error("No stream found");

      const id = nanoid();
      const responseMessage: Message = { id, isUserMessage: false, text: "" };
      addMessage(responseMessage);
      setIsMessageUpdating(true);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        updateMessage(id, (prev) => prev + chunkValue);
        text += chunkValue;
      }

      setIsMessageUpdating(false);
      setInput("");

      if (text.includes("###:") || text.includes("return") || text.includes("Complexity:")) {
        onShowRightPanel();
      }

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    },
    onError(_, message) {
      toast.error("Something went wrong. Please try again.");
      removeMessage(message.id);
      textareaRef.current?.focus();
    },
  });

  return (
    <div {...props} className={cn(className)}>
      <div className={cn("relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none", disabled && "opacity-50 pointer-events-none")}>
        <TextareaAutosize
          ref={textareaRef}
          rows={2}
          maxRows={4}
          disabled={disabled || isPending}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabled) {
                sendMessage({ id: nanoid(), isUserMessage: true, text: input });
              }
            }
          }}
          placeholder={disabled ? "Chat disabled. Use right panel." : "Write a message..."}
          className="peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <button
            onClick={() => {
              if (!disabled && input.trim()) {
                sendMessage({ id: nanoid(), isUserMessage: true, text: input });
              }
            }}
            disabled={disabled || isPending}
            className="inline-flex items-center justify-center rounded-full p-2 bg-[#4E7678] text-[white] hover:bg-[#659093] transition disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-[#77A4A6] m-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;