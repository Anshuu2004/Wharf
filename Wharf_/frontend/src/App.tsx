import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Header, Footer, BottomNav } from './components/layout'
import { 
  HomePage,
  GeneratorPage,
  ProfileGeneratorPage,
  AuthCallback
} from './pages'
import { ToastProvider } from './components/ui'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/^\/+/, '') || 'home';

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-wharf-surface-primary">
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/profile" element={<ProfileGeneratorPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        
        <Footer />
        
        <BottomNav 
          currentPage={pathname} 
          onNavigate={(page) => {
            navigate(`/${page === 'home' ? '' : page}`);
            window.scrollTo(0, 0);
          }} 
        />
      </div>
    </ToastProvider>
  )
}

export default App