'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppURL, generateWhatsAppMessage } from '@/lib/whatsapp'
import type { OrderData, Store } from '@/types'

interface WhatsAppButtonProps {
  orderData: OrderData
  storeConfig: Store
  disabled?: boolean
}

export function WhatsAppButton({ orderData, storeConfig, disabled }: WhatsAppButtonProps) {
  const handleClick = () => {
    const message = generateWhatsAppMessage(orderData, storeConfig)
    const url = buildWhatsAppURL(storeConfig.whatsapp_number, message)
    window.open(url, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-6"
      size="lg"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Enviar pedido por WhatsApp
    </Button>
  )
}
