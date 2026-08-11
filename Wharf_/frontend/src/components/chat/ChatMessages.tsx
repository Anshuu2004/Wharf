import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ChatMessage, QuickPrompts } from '../chat';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: { code: string; language: string }[];
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isFetchingSession?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onQuickPromptSelect?: (prompt: string) => void;
  onEditMessage?: (msgId: string, newContent: string) => void;
}

export const ChatMessages = ({
  messages,
  isLoading,
  isFetchingSession,
  messagesEndRef,
  onQuickPromptSelect,
  onEditMessage,
}: ChatMessagesProps) => {
  if (isFetchingSession) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col space-y-4">
            {/* User Message Skeleton */}
            <div className="flex justify-end pr-2">
              <div className="w-2/3 max-w-xl border-2 border-wharf-border-primary bg-wharf-surface-secondary/40 p-4 rounded-xl rounded-tr-none animate-pulse">
                <div className="h-4 bg-wharf-border-secondary rounded w-full mb-2" />
                <div className="h-4 bg-wharf-border-secondary rounded w-5/6" />
              </div>
            </div>
            {/* Bot Message Skeleton */}
            <div className="flex justify-start">
              <div className="flex gap-4 w-full">
                <div className="w-10 h-10 border-2 border-wharf-border-primary bg-wharf-surface-secondary rounded-md flex-shrink-0 animate-pulse" />
                <div className="flex-1 max-w-2xl border-2 border-wharf-border-primary bg-wharf-surface-primary p-4 rounded-xl rounded-tl-none animate-pulse">
                  <div className="h-4 bg-wharf-border-secondary rounded w-3/4 mb-3" />
                  <div className="h-4 bg-wharf-border-secondary rounded w-full mb-2" />
                  <div className="h-4 bg-wharf-border-secondary rounded w-5/6 mb-2" />
                  <div className="h-4 bg-wharf-border-secondary rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col justify-between">
        {/* Welcome Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto w-full text-center">
            <div className="w-16 h-16 border-2 border-wharf-border-primary flex items-center justify-center mx-auto mb-4 bg-wharf-pink/10 rounded-2xl">
              <Bot className="w-10 h-10 text-wharf-pink-dark" />
            </div>
            <h2 className="font-display font-black text-2xl tracking-tighter mb-2">
              Welcome to WHARF CHAT
            </h2>
            <p className="font-mono text-sm text-wharf-text-secondary capitalize">
              Paste a GitHub repository URL & ask anything about the codebase...
            </p>
          </div>
        </div>

        {/* Quick Prompts */}
        {onQuickPromptSelect && (
          <div className="w-full">
            <QuickPrompts onSelect={onQuickPromptSelect} />
          </div>
        )}
      </div>
    );
  }

  const isNewDay = (prevDate: Date, currDate: Date) => {
    return prevDate.toDateString() !== currDate.toDateString();
  };

  let lastDate: Date | null = null;

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {messages.map((message, idx) => {
          const messageDate = new Date(message.timestamp);
          const showDivider = !lastDate || isNewDay(lastDate, messageDate);
          lastDate = messageDate;

          return (
            <React.Fragment key={message.id}>
              {showDivider && (
                <div className="flex items-center justify-center my-6">
                  <div className="h-px bg-wharf-border-primary flex-1" />
                  <span className="px-4 font-mono text-[10px] font-bold text-wharf-text-secondary uppercase">
                    {messageDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="h-px bg-wharf-border-primary flex-1" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
            <ChatMessage
              id={message.id}
              role={message.role}
              content={message.content}
              codeBlocks={message.codeBlocks}
              timestamp={message.timestamp}
              onEdit={onEditMessage}
            />
              </motion.div>
            </React.Fragment>
          );
        })}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-4">
              <div className="w-8 h-8 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center overflow-hidden">
                  <Bot className="w-5 h-5 text-wharf-pink-dark" />
              </div>
              <div className="border-2 border-wharf-border-primary bg-wharf-surface-secondary p-4">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-wharf-pink animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-wharf-pink animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-wharf-pink animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};
