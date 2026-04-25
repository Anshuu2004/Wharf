import { useState } from 'react'
import { Header, Footer, PageWrapper, BottomNav } from './components/layout'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="min-h-screen flex flex-col bg-wharf-surface-primary">
      <Header />
      
      <PageWrapper>
        {/* Your page content here */}
        <div className="pb-24"> {/* Padding for bottom nav */}
          <h1 className="font-display font-black text-4xl">Welcome to WHARF</h1>
          <p className="font-mono mt-4">Generate documentation for any GitHub repo.</p>
        </div>
      </PageWrapper>
      
      <Footer />
      
      <BottomNav 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
    </div>
  )
}

export default App