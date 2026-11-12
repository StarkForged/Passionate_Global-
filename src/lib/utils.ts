import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-style class merge (used by the ported Magic UI / Aceternity components). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
