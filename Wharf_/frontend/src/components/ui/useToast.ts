import { createContext, useContext } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
)

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}

export type { ToastType }