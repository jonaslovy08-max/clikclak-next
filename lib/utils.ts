import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Fusionne des classes Tailwind sans conflits — à utiliser dans tous les composants */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
