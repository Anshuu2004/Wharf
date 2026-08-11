import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Home,
  FolderCode,
  Settings,
  User,
  Pencil,
  GitBranch,
  MoreVertical,
  Pin,
  PinOff,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  repoUrl?: string;
  pinned?: boolean;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  onPinSession?: (id: string) => void;
  onUnpinSession?: (id: string) => void;
  isLoading?: boolean;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  isLoading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onPinSession,
  onUnpinSession,
}: ChatSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FolderCode, label: 'Generator', path: '/generator' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // Sort Sessions: Pinned First, Then By Timestamp — Memoized To Avoid Re-Sort On Every Render
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }),
    [sessions]
  );

  // Auto-Focus Input When Editing Starts
  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

  // Handle Click Outside To Cancel Rename
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingSessionId && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setEditingSessionId(null);
        setEditTitle('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingSessionId]);

  const handleRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setDropdownOpen(null);
  };

  const handleSaveRename = () => {
    if (editingSessionId && editTitle.trim() && onRenameSession) {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    setDropdownOpen(null);
    setDeleteConfirm(sessionId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDeleteSession(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handlePinToggle = (session: ChatSession) => {
    if (session.pinned) {
      onUnpinSession?.(session.id);
    } else {
      onPinSession?.(session.id);
    }
    setDropdownOpen(null);
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="p-3 border-2 border-wharf-border-primary/60 rounded-xl animate-pulse">
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3.5 bg-wharf-border-secondary rounded w-3/4" />
            </div>
            <div className="h-2.5 bg-wharf-border-secondary rounded w-5/6" />
          </div>
          <div className="flex-shrink-0 ml-2">
            <div className="w-6 h-6 bg-wharf-border-secondary rounded" />
          </div>
        </div>
        <div className="flex justify-end mt-1">
          <div className="h-2.5 bg-wharf-border-secondary rounded w-10" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-wharf-surface-secondary">
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-6 max-w-sm w-full shadow-brutal">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-wharf-error" />
              <h3 className="font-display font-bold text-lg">Delete Conversation?</h3>
            </div>
            <p className="text-sm font-mono text-wharf-text-secondary mb-6">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border-2 border-wharf-border-primary bg-wharf-error text-wharf-white font-mono text-xs font-bold hover:bg-wharf-error/80 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="p-1 border-b-2 border-wharf-border-primary bg-wharf-surface-secondary">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 pt-1 pb-[0.3rem] border-2 transition-all cursor-pointer ${
                location.pathname === item.path
                  ? 'bg-wharf-pink border-wharf-border-primary shadow-brutal-sm'
                  : 'border-transparent hover:scale-115'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="py-2 px-4 border-b-2 border-wharf-border-primary">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 mb-[0.28rem] border-2 border-wharf-border-primary bg-wharf-pink font-mono font-bold text-sm hover:bg-wharf-pink-dark transition-colors shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hidden">
        {isLoading ? (
          // Enhanced Skeleton Cards
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : sortedSessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-wharf-text-secondary mx-auto mb-2" />
            <p className="text-xs font-mono text-wharf-text-secondary capitalize">
              No chat history
            </p>
          </div>
        ) : (
          sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 border-2 transition-all rounded-xl cursor-pointer ${
                currentSessionId === session.id
                  ? 'border-wharf-border-primary bg-wharf-pink/20 shadow-brutal-sm'
                  : 'border-wharf-border-primary/60 hover:border-wharf-border-primary'
              } ${session.pinned ? 'border-wharf-text-primary' : ''}`}
              onClick={() => {
                if (!editingSessionId) {
                  onSelectSession(session.id);
                }
              }}
            >
              <div className="flex flex-col">
                {/* Top Row: Title and Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {session.pinned && (
                        <Pin className="w-3.5 h-3.5 text-wharf-error flex-shrink-0" />
                      )}
                      {session.repoUrl && !session.pinned && (
                        <GitBranch className="w-3.5 h-3.5 text-wharf-text-secondary flex-shrink-0" />
                      )}
                      {editingSessionId === session.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-xs font-mono bg-wharf-surface-primary border-2 border-wharf-border-primary px-2 py-0.5 focus:outline-none focus:border-wharf-pink"
                          />
                        </div>
                      ) : (
                        <h3 className="text-xs font-mono font-bold truncate">{session.title}</h3>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-wharf-text-secondary truncate">
                      {session.preview}
                    </p>
                  </div>

                  {/* Three Dots Dropdown */}
                  <div className="relative flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!editingSessionId) {
                          setDropdownOpen(dropdownOpen === session.id ? null : session.id);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-wharf-surface-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-wharf-text-secondaey" />
                    </button>

                    {dropdownOpen === session.id && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-40 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal">
                        <div className="py-1">
                          {/* Pin/Unpin Option */}
                          {onPinSession && onUnpinSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePinToggle(session);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
                            >
                              {session.pinned ? (
                                <>
                                  <PinOff className="w-3.5 h-3.5" />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="w-3.5 h-3.5" />
                                  Pin
                                </>
                              )}
                            </button>
                          )}

                          {/* Rename Option */}
                          {onRenameSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(session);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Rename
                            </button>
                          )}

                          {/* Delete Option */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(session.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-wharf-error hover:bg-wharf-error/10 transition-colors border-t border-wharf-border-secondary cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Date */}
                <div className="flex justify-end mt-1">
                  <p className="text-[9px] font-mono text-wharf-text-secondary">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t-2 border-wharf-border-primary">
        <div className="text-[9px] font-mono text-wharf-text-secondary text-center capitalize">
          {isLoading ? 'Loading conversations...' : `${sortedSessions.length} conversation${sortedSessions.length !== 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  );
};