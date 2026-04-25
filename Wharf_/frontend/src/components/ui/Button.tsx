import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'outline' | 'gradient' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'btn',
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      variant === 'success' && 'btn-success',
      variant === 'danger' && 'btn-danger',
      variant === 'warning' && 'btn-warning',
      variant === 'info' && 'btn-info',
      variant === 'ghost' && 'btn-ghost',
      variant === 'outline' && 'btn-outline',
      variant === 'gradient' && 'btn-gradient',
      variant === 'dark' && 'btn-dark',
      size === 'sm' && 'btn-sm',
      size === 'md' && 'btn-md',
      size === 'lg' && 'btn-lg',
      fullWidth && 'btn-full-width',
      className
    )

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }