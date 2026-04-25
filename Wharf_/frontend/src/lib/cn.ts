import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes without conflicts
 * Usage: cn("btn", "btn-primary", className)
*/

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}