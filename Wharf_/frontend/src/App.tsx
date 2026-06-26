import { Routes, Route } from 'react-router-dom'
import { Header, Footer, BottomNav } from './components/layout'
import { HomePage } from './pages/HomePage'
import { GeneratorPage } from './pages/GeneratorPage'
import { ProfileGeneratorPage } from './pages/ProfileGeneratorPage'
import { AuthCallback } from './pages/AuthCallback'
import { ToastProvider } from './components/ui/ToastProvider'

function App() {
  const pathname = window.location.pathname.replace('/', '') || 'home'

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
          onNavigate={(page) => window.location.href = `/${page === 'home' ? '' : page}`} 
        />
      </div>
    </ToastProvider>
  )
}

export default App