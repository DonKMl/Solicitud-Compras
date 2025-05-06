import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteToTabName = (site: string): string => {
  // Convert site name to a valid sheet tab name
  // Remove special chars and limit length if needed
  return site.replace(/[^\w\s]/gi, '').trim();
};

export const formatDateForSheet = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const formatDateTime = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return now.toLocaleDateString('es-ES', options);
};
