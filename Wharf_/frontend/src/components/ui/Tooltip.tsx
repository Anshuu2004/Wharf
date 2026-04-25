import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 bg-wharf-surface-inverted text-wharf-text-inverted',
            'font-mono text-xs whitespace-nowrap border-2 border-wharf-border-primary',
            'shadow-hard-sm',
            positionClasses[position]
          )}
        >
          <div className="relative">
            {content}
            <div
              className={cn(
                'absolute w-2 h-2 bg-wharf-surface-inverted border-2 border-wharf-border-primary rotate-45',
                position === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
                position === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0',
                position === 'left' && 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0',
                position === 'right' && 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}