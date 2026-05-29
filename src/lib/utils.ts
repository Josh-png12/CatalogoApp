import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getEffectivePrice(product: { price: number; final_price?: number }): number {
  return product.final_price ?? product.price
}

export function hasActivePromo(product: { promo_id?: string }): boolean {
  return !!product.promo_id
}

export function formatDiscount(product: {
  promo_discount_type?: 'percentage' | 'fixed'
  promo_discount_value?: number
}): string {
  if (!product.promo_discount_type || product.promo_discount_value == null) return ''
  if (product.promo_discount_type === 'percentage') return `-${product.promo_discount_value}%`
  return `-${formatCOP(product.promo_discount_value)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
