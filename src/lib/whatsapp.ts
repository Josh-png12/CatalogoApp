import type { OrderData, Store } from '@/types'
import { formatCOP } from './utils'

export function generateWhatsAppMessage(
  orderData: OrderData,
  storeConfig?: Partial<Store>
): string {
  const lines: string[] = []
  const storeName = storeConfig?.name ?? 'Angélica'

  lines.push(`¡Hola ${storeName}! 💄 Me gustaría hacer este pedido:`)
  lines.push('')

  let total = 0

  for (const item of orderData.items) {
    const basePrice = item.product.price + (item.variant?.price_delta ?? 0)
    const unitPrice = item.final_price ?? basePrice
    total += unitPrice * item.quantity

    let productLine = `• ${item.product.name}`
    if (item.variant) {
      productLine += ` (${item.variant.name}: ${item.variant.value})`
    }
    productLine += ` x${item.quantity} — ${formatCOP(unitPrice)}`

    if (item.final_price != null && item.final_price < basePrice) {
      const diff = Math.round(((basePrice - item.final_price) / basePrice) * 100)
      productLine += ` (antes ${formatCOP(basePrice)}, ${diff}% OFF)`
    }

    lines.push(productLine)
  }

  lines.push('')
  lines.push(`💰 *Total: ${formatCOP(total)}*`)
  lines.push('')
  lines.push('📋 *Mis datos:*')
  lines.push(`• Nombre: ${orderData.customer_name}`)
  lines.push(`• Dirección: ${orderData.customer_address}`)

  if (orderData.customer_phone) {
    lines.push(`• Teléfono: ${orderData.customer_phone}`)
  }
  if (orderData.note) {
    lines.push(`• Nota: ${orderData.note}`)
  }

  lines.push('')
  lines.push('¡Gracias! 😊')

  return lines.join('\n')
}

export function buildWhatsAppURL(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const normalizedPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}
