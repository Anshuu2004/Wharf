import React, { Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer, BottomNav } from './components/layout';
import { ToastProvider } from './components/ui';

const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const GeneratorPage = React.lazy(() => import('./pages/GeneratorPage').then(m => ({ default: m.GeneratorPage })));
const ProfileGeneratorPage = React.lazy(() => import('./pages/ProfileGeneratorPage').then(m => ({ default: m.ProfileGeneratorPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/^\/+/, '') || 'home';

  const isChatPage = location.pathname === '/chat';

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-wharf-surface-primary">
        {!isChatPage && <Header />}

        <main className="flex-1">
          <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center font-mono font-bold text-wharf-text-secondary">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/profile" element={<ProfileGeneratorPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        {!isChatPage && <Footer />}

        {/* BottomNav */}
        {!isChatPage && (
          <BottomNav
            currentPage={pathname}
            onNavigate={(page) => {
              navigate(`/${page === 'home' ? '' : page}`);
              window.scrollTo(0, 0);
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
