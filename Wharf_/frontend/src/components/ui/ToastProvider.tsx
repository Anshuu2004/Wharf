import { useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { ToastContext, type ToastType } from './useToast'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString()

    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const toastStyles = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn('toast', toastStyles[toast.type])}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' && <span>✓</span>}
                {toast.type === 'error' && <span>✗</span>}
                {toast.type === 'warning' && <span>⚠</span>}
                {toast.type === 'info' && <span>ℹ</span>}
                <span className="flex-1">{toast.message}</span>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}