import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'pink' | 'cyan' | 'green' | 'yellow' | 'peach' | 'purple' | 'teal' | 'coral' | 'lavender' | 'gold' | 'dark' | 'ghost' | 'default'
  size?: 'sm' | 'md'
  icon?: ReactNode
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', icon, className, ...props }, ref) => {
    const variantStyles = {
      pink: 'bg-wharf-pink text-black',
      cyan: 'bg-wharf-cyan text-black',
      green: 'bg-wharf-green text-black',
      yellow: 'bg-wharf-yellow text-black',
      peach: 'bg-wharf-orange text-black',
      purple: 'bg-wharf-purple text-black',
      teal: 'bg-wharf-teal text-black',
      coral: 'bg-wharf-orange text-black',
      lavender: 'bg-wharf-purple text-black',
      gold: 'bg-wharf-yellow text-black',
      dark: 'bg-black text-white',
      ghost: 'bg-transparent border-wharf-border-secondary text-wharf-text-secondary',
      default: 'bg-wharf-surface-secondary text-wharf-text-primary',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'badge inline-flex items-center gap-1 font-mono font-bold border border-wharf-border-primary transition-all duration-200',
          variantStyles[variant],
          size === 'sm' && 'text-[10px] px-1.5 py-0.5',
          size === 'md' && 'text-xs px-2 py-1',
          className
        )}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }