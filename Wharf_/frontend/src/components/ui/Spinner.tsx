import { cn } from '../../lib/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'teal' | 'coral' | 'lavender' | 'gold'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const variantColors = {
  teal: 'border-wharf-teal',
  coral: 'border-wharf-coral',
  lavender: 'border-wharf-lavender',
  gold: 'border-wharf-gold',
}

export const Spinner = ({ size = 'md', variant = 'teal', className }: SpinnerProps) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-t-transparent',
          sizeClasses[size],
          variantColors[variant],
          className
        )}
      />
    </div>
  )
}