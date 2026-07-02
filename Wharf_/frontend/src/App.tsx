import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer, BottomNav } from './components/layout';
import { HomePage, GeneratorPage, ProfileGeneratorPage, ChatPage, AuthCallback } from './pages';
import { ToastProvider } from './components/ui';

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/profile" element={<ProfileGeneratorPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
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
