import { useState, useRef, useEffect } from 'react';
import { Bot, User, Copy, Check, Edit2, CheckCircle, X } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlocks?: { code: string; language: string }[];
  timestamp: Date;
  onEdit?: (id: string, newContent: string) => void;
}

// Parses Inline Markdown: **bold**, *italic*, `code`
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex Matches **bold**, *italic*, `code` In Order
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      parts.push(
        <strong key={match.index} className="font-bold text-wharf-text-primary">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4] !== undefined) {
      parts.push(
        <code
          key={match.index}
          className="font-mono bg-wharf-surface-primary border border-wharf-border-secondary px-1 py-0.5 text-xs text-wharf-green-darker rounded-none"
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function formatContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Multiline Code Block
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <div key={i} className="my-4">
          <CodeBlock code={codeLines.join('\n')} language={language || 'text'} />
        </div>
      );
      i++; // Skip Closing ```
      continue;
    }

    // Empty Line
    if (!trimmed) {
      result.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      result.push(
        <h3
          key={i}
          className="font-display font-black text-base mt-4 mb-1.5 text-wharf-text-primary"
        >
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      result.push(
        <h2 key={i} className="font-display font-black text-lg mt-5 mb-2 text-wharf-text-primary">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H1
    if (trimmed.startsWith('# ')) {
      result.push(
        <h1 key={i} className="font-display font-black text-xl mt-6 mb-2 text-wharf-text-primary">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Bullet (Supports Leading Spaces For Nesting)
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      result.push(
        <div key={i} className="flex gap-2 mb-0.5" style={{ marginLeft: `${indent * 8 + 12}px` }}>
          <span className="text-wharf-pink flex-shrink-0 mt-0.5">•</span>
          <span className="font-mono text-sm text-wharf-text-secondary leading-relaxed">
            {parseInline(bulletMatch[2])}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered List
    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const indent = numberedMatch[1].length;
      result.push(
        <div key={i} className="flex gap-2 mb-0.5" style={{ marginLeft: `${indent * 8 + 12}px` }}>
          <span className="font-mono text-sm font-bold text-wharf-pink-dark flex-shrink-0">
            {numberedMatch[2]}.
          </span>
          <span className="font-mono text-sm text-wharf-text-secondary leading-relaxed">
            {parseInline(numberedMatch[3])}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      result.push(<hr key={i} className="border-wharf-border-secondary my-3" />);
      i++;
      continue;
    }

    // Regular Paragraph
    result.push(
      <p key={i} className="font-mono text-sm text-wharf-text-secondary leading-relaxed mb-1.5">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return result;
}

export const ChatMessage = ({
  id,
  role,
  content,
  codeBlocks,
  timestamp,
  onEdit,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== content && onEdit) {
      onEdit(id, editContent.trim());
    }
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${role === 'user' ? 'order-2' : 'order-1'}`}>
        <div
          className={`w-8 h-8 border-2 border-wharf-border-primary flex items-center justify-center ${
            role === 'user' ? 'bg-wharf-pink' : 'bg-wharf-surface-secondary'
          }`}
        >
          {role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      </div>

      {/* Message */}
      <div className={`flex-1 max-w-[80%] ${role === 'user' ? 'order-1' : 'order-2'}`}>
        <div
          className={`border-2 border-wharf-border-primary p-4 ${
            role === 'user' ? 'bg-wharf-pink/20' : 'bg-wharf-surface-secondary'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                  }
                }}
                className="w-full bg-black/10 border-2 border-black/20 p-2 font-mono text-sm resize-none focus:outline-none focus:border-black/50 rounded-none text-black"
                rows={1}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-2 py-1 bg-black/10 hover:bg-black/20 font-mono text-xs transition-colors"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="flex items-center gap-1 px-2 py-1 bg-black hover:bg-black/80 text-white font-mono text-xs transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Save & Resend
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm">
                {role === 'assistant' ? (
                  formatContent(content)
                ) : (
                  <p className="font-mono text-sm leading-relaxed">{content}</p>
                )}
              </div>

              {/* Code Blocks */}
              {codeBlocks && codeBlocks.length > 0 && (
                <div className="mt-4 space-y-3">
                  {codeBlocks.map((block, idx) => (
                    <CodeBlock key={idx} code={block.code} language={block.language} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className={`flex gap-2 mt-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {!isEditing && role === 'user' && onEdit && (
            <button
              onClick={() => {
                setEditContent(content);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 border border-wharf-border-secondary font-mono text-[10px] hover:border-wharf-border-primary hover:bg-wharf-surface-secondary transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          )}
          <button
            onClick={() => copyToClipboard(content)}
            className="flex items-center gap-1 px-2 py-0.5 border border-wharf-border-secondary font-mono text-[10px] hover:border-wharf-border-primary hover:bg-wharf-surface-secondary transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <span className="font-mono text-[9px] text-wharf-text-tertiary/60 self-center">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
