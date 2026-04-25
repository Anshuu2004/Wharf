import { useState } from 'react'
import { Header, Footer, BottomNav } from './components/layout'
import { HomePage } from './pages/HomePage'
import { ToastProvider } from './components/ui/ToastProvider'

// Future pages (to be created)
// import { GeneratorPage } from './pages/GeneratorPage'
// import { TreeMapPage } from './pages/TreeMapPage'
// import { HealthPage } from './pages/HealthPage'
// import { AnalyticsPage } from './pages/AnalyticsPage'
// import { SettingsPage } from './pages/SettingsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  // Render different pages based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      // case 'generator':
      //   return <GeneratorPage />
      // case 'treemap':
      //   return <TreeMapPage />
      // case 'health':
      //   return <HealthPage />
      // case 'analytics':
      //   return <AnalyticsPage />
      // case 'settings':
      //   return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-wharf-surface-primary">
        <Header />
        
        <main className="flex-1">
          {renderPage()}
        </main>
        
        <Footer />
        
        <BottomNav 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
        />
      </div>
    </ToastProvider>
  )
}

export default App