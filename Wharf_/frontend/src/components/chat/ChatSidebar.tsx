import { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Home,
  FolderCode,
  LayoutDashboard,
  User,
  Pencil,
  Check,
  X,
  GitBranch,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  repoUrl?: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
}: ChatSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FolderCode, label: 'Generator', path: '/generator' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  const handleRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = () => {
    if (editingSessionId && editTitle.trim() && onRenameSession) {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') handleCancelRename();
  };

  return (
    <div className="h-full flex flex-col bg-wharf-surface-secondary">
      {/* Navigation */}
      <div className="p-1 border-b-2 border-wharf-border-primary bg-wharf-surface-secondary">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 pt-1 pb-[0.3rem] border-2 transition-all ${
                location.pathname === item.path
                  ? 'bg-wharf-pink border-wharf-border-primary shadow-brutal-sm'
                  : 'border-transparent hover:border-wharf-border-secondary hover:bg-wharf-surface-primary'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="py-1.5 px-4 border-b-2 border-wharf-border-primary">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 mb-[0.28rem] border-2 border-wharf-border-primary bg-wharf-pink font-mono font-bold text-sm hover:bg-wharf-pink-dark transition-colors shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-wharf-text-secondary mx-auto mb-2" />
            <p className="text-xs font-mono text-wharf-text-secondary  capitalize">
              No chat history
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 border-2 transition-all cursor-pointer ${
                currentSessionId === session.id
                  ? 'border-wharf-border-primary bg-wharf-pink/10 shadow-brutal-sm'
                  : 'border-wharf-border-secondary hover:border-wharf-border-primary'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {session.repoUrl && (
                      <GitBranch className="w-3 h-3 text-wharf-text-tertiary flex-shrink-0" />
                    )}
                    {editingSessionId === session.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-xs font-mono bg-wharf-surface-primary border-2 border-wharf-border-primary px-2 py-0.5 focus:outline-none focus:border-wharf-pink"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRename();
                          }}
                          className="p-1 hover:bg-wharf-green/20 transition-colors"
                        >
                          <Check className="w-3 h-3 text-wharf-green" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRename();
                          }}
                          className="p-1 hover:bg-wharf-orange/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-wharf-orange" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-xs font-mono font-bold truncate">{session.title}</h3>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-wharf-text-tertiary truncate">
                    {session.preview}
                  </p>
                  <p className="text-[9px] font-mono text-wharf-text-tertiary/60 mt-1">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {editingSessionId !== session.id && onRenameSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(session);
                      }}
                      className="p-1 hover:bg-wharf-pink/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-wharf-text-tertiary hover:text-wharf-text-primary" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 hover:bg-wharf-orange/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-wharf-text-tertiary hover:text-wharf-orange" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t-2 border-wharf-border-primary">
        <div className="text-[9px] font-mono text-wharf-text-secondary text-center capitalize">
          {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
