
'use client'

import { MessagesContext } from '@/context/messages'
import { cn } from '@/lib/utils'
import { FC, HTMLAttributes, useContext, ReactNode, ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";


interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement> {}

const ChatMessages: FC<ChatMessagesProps> = ({ className, ...props }) => {
  const { messages } = useContext(MessagesContext)
  const inverseMessages = [...messages].reverse() // Keeps newest messages at the bottom
  

  return (
    <div
      {...props}
      className={cn(
        'flex flex-col-reverse flex-grow w-screen h-[calc(100vh-100px)] overflow-y-auto pb-20 pt-4 pr-4',
        'scrollbar-w-2 scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-thumb-rounded'
      )}
    >
      <div className="w-full max-w-3xl mx-auto px-4"></div>  
      {inverseMessages.map((message) => (
        <div className="chat-message flex w-full pl-2 pr-7" key={`${message.id}-${message.id}`}>
          <div
            className={cn('flex flex-col space-y-2 text-sm w-full', {
              'items-end': message.isUserMessage, // ✅ User messages on the right
              'items-start': !message.isUserMessage, // ✅ AI messages on the left
            })}
          >
            <div
              className={cn(
                'px-4 py-2 rounded-lg max-w-[75%] text-base leading-relaxed break-words',
                {
                  'bg-[#77A4A6] text-white self-end': message.isUserMessage,
                  'bg-gray-100 text-gray-900 self-start': !message.isUserMessage,
                }
              )}
            >
              <ReactMarkdown
                className="prose prose-sm"
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({
                    inline = false,
                    className,
                    children,
                    ...props
                  }: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatMessages
