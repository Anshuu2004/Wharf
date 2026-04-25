import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hard' | 'hard-sm'
  hoverable?: boolean
  header?: ReactNode
  footer?: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', hoverable = false, header, footer, className, ...props }, ref) => {
    const variantStyles = {
      default: 'card',
      hard: 'card card-hard',
      'hard-sm': 'card card-hard-sm',
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          hoverable && 'card-hoverable cursor-pointer',
          className
        )}
        {...props}
      >
        {header && <div className="border-b-2 border-wharf-border-primary pb-4 mb-4">{header}</div>}
        <div className="card-body">{children}</div>
        {footer && <div className="border-t-2 border-wharf-border-primary pt-4 mt-4">{footer}</div>}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }