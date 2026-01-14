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

/**
 * Generate a deterministic pseudo-random number from a string seed.
 * Useful for placeholder counts that must stay identical between SSR and CSR.
 */
export function getDeterministicCount(seed: string, min: number = 10, max: number = 99): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  const range = Math.max(max - min + 1, 1)
  return Math.abs(hash) % range + min
}

/**
 * Normalize email address for consistent storage and comparison.
 * Converts to lowercase and trims whitespace.
 * @param email - Email address to normalize
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return ''
  return email.toLowerCase().trim()
}
