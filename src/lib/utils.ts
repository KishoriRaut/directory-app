import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a person's name
 * @param name - Full name string
 * @returns Uppercase initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return ''
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) // Limit to 2 characters for better display
}
