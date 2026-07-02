import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import {
  ChatSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
  RepoContextBar,
  SuggestedFollowups,
} from '../components/chat';
import { Menu, X, Code, Users, Briefcase, Shield, Star, GitFork } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: { code: string; language: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
  repoUrl?: string;
  repoData?: {
    name: string;
    owner: string;
    language: string;
    stars: number;
    forks: number;
    description: string;
  };
}

const personas = [
  { id: 'developer', label: 'Developer', icon: Code, color: 'wharf-cyan' },
  { id: 'interviewer', label: 'Interviewer', icon: Users, color: 'wharf-pink' },
  { id: 'product', label: 'Product', icon: Briefcase, color: 'wharf-purple' },
  { id: 'security', label: 'Security', icon: Shield, color: 'wharf-orange' },
];

export const ChatPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('wharf_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem('wharf_current_session_id') || null;
  });

  useEffect(() => {
    localStorage.setItem('wharf_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Persist Active Session ID Across Refreshes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('wharf_current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('wharf_current_session_id');
    }
  }, [currentSessionId]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('developer');
  const [repoUrl, setRepoUrl] = useState('');
  const [isRepoAnalyzed, setIsRepoAnalyzed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages]);

  // Sync RepoUrl & Analysis State When Switching Between Sessions
  useEffect(() => {
    if (currentSession?.repoUrl) {
      setRepoUrl(currentSession.repoUrl);
      setIsRepoAnalyzed(!!currentSession.repoData);
    } else {
      setRepoUrl('');
      setIsRepoAnalyzed(false);
    }
  }, [currentSessionId, currentSession?.repoUrl, currentSession?.repoData]);

  // Scroll To Bottom On New Messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      preview: 'Start a new conversation',
      messages: [],
      repoUrl: repoUrl || undefined,
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setIsRepoAnalyzed(false);
  };

  const handleAnalyzeRepo = async () => {
    if (!repoUrl) return;
    setIsAnalyzingRepo(true);
    try {
      const response = await api.post('/chat/analyze', { repoUrl });
      const meta = response.data.data.meta;

      setSessions((prev) => {
        const sessionExists = prev.some((s) => s.id === currentSessionId);
        let activeSessionId = currentSessionId;
        let newState = [...prev];

        if (!sessionExists || !activeSessionId) {
          activeSessionId = Date.now().toString();
          const newSession: ChatSession = {
            id: activeSessionId,
            // Title Will Be Set To Owner/Repo Below Via The Map
            title: `${meta.owner}/${meta.name}`,
            timestamp: new Date(),
            preview: 'Start a conversation...',
            messages: [],
            repoUrl: repoUrl,
          };
          newState = [newSession, ...newState];
          setCurrentSessionId(activeSessionId);
        }

        return newState.map((s) =>
          s.id === activeSessionId
            ? {
              ...s,
              // Always Update Title To Owner/Repo When Analyzed
              title: `${meta.owner}/${meta.name}`,
              repoUrl: repoUrl,
              repoData: {
                name: meta.name,
                owner: meta.owner,
                language: meta.language || 'Unknown',
                stars: meta.stars,
                forks: 0,
                description: meta.description || 'No description provided.',
              },
            }
            : s
        );
      });
      setIsRepoAnalyzed(true);
    } catch (error) {
      console.error('Failed to analyze repository:', error);
      // Fallback Behavior Or Error Toast Could Go Here
    } finally {
      setIsAnalyzingRepo(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      // Synchronously Create Placeholder If Starting Raw
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        timestamp: new Date(),
        preview: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        repoUrl: repoUrl || undefined,
      };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setIsRepoAnalyzed(false);
      activeSessionId = newSession.id;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
            ...s,
            messages: [...s.messages, userMessage],
            // Only Set Preview From The Very First User Message
            preview: s.messages.length === 0
              ? content.slice(0, 60) + (content.length > 60 ? '...' : '')
              : s.preview,
            // Only Set Title If No RepoData (RepoData Sessions Already Have Owner/Repo As Title)
            title: !s.repoData && s.messages.length === 0
              ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
              : s.title,
          }
          : s
      )
    );

    setIsSendingMessage(true);

    try {
      const activeSession = sessions.find(s => s.id === activeSessionId) || { repoUrl, messages: [], repoData: undefined };
      const token = useAuthStore.getState().token;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          question: content,
          persona: selectedPersona,
          repoUrl: activeSession.repoUrl || repoUrl,
          repoData: activeSession.repoData,
          history: activeSession.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      const assistantMessageId = (Date.now() + 1).toString();
      let fullResponse = "";
      let buffer = "";

      // Attach Blank Assistant Message Placeholder
      setSessions((prev) => prev.map(s => s.id === activeSessionId
        ? { ...s, messages: [...s.messages, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }] }
        : s));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep The Last Segment In Buffer If It Doesn't End With A Newline
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: "[DONE]"') break;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '');
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) fullResponse += parsed.text;
              } catch {
                // Removed The 'E' Parameter Since It's Unused
                console.warn('Failed to parse SSE line JSON', dataStr);
              }
            }
          }
        }

        // Incrementally Update UI
        setSessions((prev) => prev.map(s => {
          if (s.id === activeSessionId) {
            const msgs = [...s.messages];
            const botMsgIdx = msgs.findIndex(m => m.id === assistantMessageId);
            if (botMsgIdx !== -1) msgs[botMsgIdx].content = fullResponse;
            return { ...s, messages: msgs };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleEditMessage = (msgId: string, newContent: string) => {
    const activeSession = sessions.find(s => s.id === currentSessionId);
    if (!activeSession) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    // Truncate Messages Above The Edited Message
    const historyToKeep = activeSession.messages.slice(0, msgIndex);

    setSessions(prev => prev.map(s => s.id === currentSessionId ? {
      ...s,
      messages: historyToKeep
    } : s));

    // Wait A Brief Moment For State To Settle, Then Resend
    setTimeout(() => {
      handleSendMessage(newContent);
    }, 50);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions.find((s) => s.id !== id)?.id || null);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  const suggestedFollowups = [
    'How do I run this locally?',
    'What are the main features?',
    'How can I contribute?',
    'Explain the architecture in detail',
  ];

  return (
    <div className="fixed inset-0 bg-wharf-surface-primary z-40">
      <div className="flex h-full max-w-8xl mx-auto">
        {/* Sidebar */}
        <div
          className={`${isSidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden border-r-2 border-wharf-border-primary bg-wharf-surface-secondary`}
        >
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onNewChat={createNewChat}
            onSelectSession={setCurrentSessionId}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-wharf-surface-primary relative">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden absolute top-4 left-4 z-10 p-2 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Header */}
          <ChatHeader
            session={currentSession}
            onExport={() => { }}
            selectedPersona={selectedPersona}
            personas={personas}
            onPersonaChange={setSelectedPersona}
          />

          {/* RepoContextBar */}
          <div className="border-y-2 border-wharf-border-primary bg-wharf-surface-secondary">
            <div className="grid grid-cols-2 divide-x-2 divide-wharf-border-primary">
              {/* Col 1: URL Input */}
              <div className="py-2 px-6">
                <RepoContextBar
                  repoUrl={repoUrl}
                  setRepoUrl={setRepoUrl}
                  onAnalyze={handleAnalyzeRepo}
                  isAnalyzing={isAnalyzingRepo}
                  repoData={currentSession?.repoData}
                  isAnalyzed={isRepoAnalyzed}
                  isLocked={!!currentSession?.repoData}
                />
              </div>

              {/* Col 2: Repo Description */}
              <div className="py-2 px-6 flex items-center min-w-0">
                {currentSession?.repoData ? (
                  <div className="w-full min-w-0">
                    {/* Repo Name */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-sm truncate">
                        {currentSession.repoData.owner}/{currentSession.repoData.name}
                      </span>

                      <div className="flex items-center gap-3">
                        {/* Language */}
                        {currentSession.repoData.language && (
                          <span className="font-mono text-[10px] text-wharf-text-secondary">
                           [ {currentSession.repoData.language} ]
                          </span>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-wharf-yellow fill-wharf-yellow" />
                          <span className="font-mono text-[10px] text-wharf-text-tertiary">
                            {currentSession.repoData.stars.toLocaleString()}
                          </span>
                        </div>

                        {/* Forks */}
                        <div className="flex items-center gap-0.5">
                          <GitFork className="w-3.5 h-3.5 text-wharf-text-tertiary" />
                          <span className="font-mono text-[10px] text-wharf-text-tertiary">
                            {currentSession.repoData.forks?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {currentSession.repoData.description && (
                      <p className="font-mono text-[10px] text-wharf-text-secondary mt-0.5 line-clamp-2">
                        {currentSession.repoData.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-wharf-text-secondary italic capitalize">
                    Analyze a repository to see its details here
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <ChatMessages
              messages={messages}
              isLoading={isSendingMessage}
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
              onQuickPromptSelect={handleSendMessage}
              onEditMessage={handleEditMessage}
            />

            {/* Suggested Follow-ups - Only Show When Messages Exist */}
            {messages.length > 0 && !isSendingMessage && (
              <div className="mt-4">
                <SuggestedFollowups suggestions={suggestedFollowups} onSelect={handleSendMessage} />
              </div>
            )}
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} isLoading={isSendingMessage} persona={selectedPersona} />
        </div>
      </div>
    </div>
  );
};