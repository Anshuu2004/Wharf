import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  persona?: string;
}

export const ChatInput = ({ onSend, isLoading, persona = 'developer' }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 56), 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [input]);

  return (
    <div className="border-t-2 border-wharf-border-primary bg-wharf-surface-secondary p-4 pb-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask About The Repository..."
          disabled={isLoading}
          rows={1}
          className="w-full px-4 py-3 font-mono text-sm border-2 border-wharf-border-primary bg-wharf-surface-primary resize-none focus:outline-none focus:border-wharf-pink transition-colors disabled:opacity-50 overflow-y-auto min-h-[56px] max-h-[150px] rounded-xl scrollbar-hidden"
          style={{ height: 'auto' }}
        />

        <div className="absolute bottom-4.5 right-3 flex items-center gap-2">
          <span className="font-mono text-[9px] text-wharf-text-tertiary">
            {input.length > 0 && `${input.length} chars`}
          </span>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 border-2 border-wharf-border-primary bg-wharf-pink hover:bg-wharf-pink-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-wharf-pink-dark" />
          <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
            Enter to send, Shift+Enter for new line
          </span>
        </div>
        <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
          {persona} mode
        </span>
      </div>
    </div>
  );
};
