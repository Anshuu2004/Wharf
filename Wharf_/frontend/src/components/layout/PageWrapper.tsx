import { type ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export const PageWrapper = ({ 
  children, 
  className = '' 
}: PageWrapperProps) => {
  return (
    <main className={`min-h-screen ${className}`}>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  )
}