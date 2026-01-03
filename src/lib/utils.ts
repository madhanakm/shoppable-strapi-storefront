import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | null | undefined) {
  if (price === null || price === undefined) return '₹0';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${numPrice.toLocaleString('en-IN')}`;
}
