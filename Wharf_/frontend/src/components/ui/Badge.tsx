import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'pink' | 'cyan' | 'green' | 'yellow' | 'peach' | 'purple' | 'teal' | 'coral' | 'lavender' | 'gold' | 'dark' | 'default'
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
      default: 'bg-wharf-surface-secondary text-wharf-text-primary',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'badge',
          variantStyles[variant],
          size === 'sm' && 'text-[10px] px-1 py-0.5',
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