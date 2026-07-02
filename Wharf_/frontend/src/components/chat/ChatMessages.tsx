import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { ChatMessage, QuickPrompts } from '../chat';

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
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onQuickPromptSelect?: (prompt: string) => void;
  onEditMessage?: (msgId: string, newContent: string) => void;
}

export const ChatMessages = ({
  messages,
  isLoading,
  messagesEndRef,
  onQuickPromptSelect,
  onEditMessage,
}: ChatMessagesProps) => {
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col justify-between">
        {/* Welcome Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto w-full text-center">
            <div className="w-16 h-16 border-2 border-wharf-border-primary flex items-center justify-center mx-auto mb-4 bg-wharf-pink/10">
              <Bot className="w-8 h-8 text-wharf-pink" />
            </div>
            <h2 className="font-display font-black text-2xl tracking-tighter mb-2">
              Welcome to WHARF Chat
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

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {messages.map((message, idx) => (
          <motion.div
            key={message.id}
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
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-4">
              <div className="w-8 h-8 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-wharf-text-tertiary" />
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
