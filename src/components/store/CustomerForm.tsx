'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { generateWhatsAppMessage, buildWhatsAppURL } from '@/lib/whatsapp'
import { useCart } from '@/hooks/useCart'
import { trackEvent } from '@/lib/analytics'
import { useStoreConfig } from '@/context/StoreConfigContext'

const schema = z.object({
  customer_name: z.string().min(1, 'El nombre es requerido'),
  customer_phone: z.string().optional(),
  customer_address: z.string().min(1, 'La dirección es requerida'),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomerFormProps {
  open: boolean
  onClose: () => void
}

export function CustomerForm({ open, onClose }: CustomerFormProps) {
  const { items, totalPrice, clearCart, closeCart } = useCart()
  const config = useStoreConfig()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleClose = () => {
    reset()
    setSubmitted(false)
    onClose()
  }

  const onSubmit = async (data: FormValues) => {
    const total = totalPrice()
    const supabase = createClient()

    // Insert order and capture its ID for analytics
    const { data: insertedOrder } = await supabase
      .from('orders')
      .insert({
        store_id: process.env.NEXT_PUBLIC_STORE_ID!,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address,
        items: JSON.stringify(items),
        total,
        status: 'pending',
      })
      .select('id')
      .single()

    // Track WhatsApp click and order created
    await Promise.all([
      trackEvent('whatsapp_click', undefined, { total, itemCount: items.length }),
      trackEvent('order_created', undefined, { order_id: insertedOrder?.id, total }),
    ])

    // Use whatsapp_number from config, fallback to env var
    const whatsappPhone = config.whatsapp_number || process.env.NEXT_PUBLIC_STORE_WHATSAPP || ''
    const message = generateWhatsAppMessage({
      items,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      note: data.note,
    })

    window.open(buildWhatsAppURL(whatsappPhone, message), '_blank')

    clearCart()
    setSubmitted(true)
    reset()

    setTimeout(() => {
      setSubmitted(false)
      onClose()
      closeCart()
    }, 2500)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar pedido</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="font-semibold text-lg">¡Pedido enviado!</p>
            <p className="text-sm text-muted-foreground">
              La consultora te contactará pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Nombre completo *</Label>
              <Input
                id="customer_name"
                placeholder="Tu nombre"
                {...register('customer_name')}
                aria-invalid={!!errors.customer_name}
              />
              {errors.customer_name && (
                <p className="text-xs text-destructive">{errors.customer_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Teléfono (opcional)</Label>
              <Input
                id="customer_phone"
                type="tel"
                placeholder="Tu número de teléfono"
                {...register('customer_phone')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer_address">Dirección o barrio *</Label>
              <Input
                id="customer_address"
                placeholder="Tu dirección o barrio de entrega"
                {...register('customer_address')}
                aria-invalid={!!errors.customer_address}
              />
              {errors.customer_address && (
                <p className="text-xs text-destructive">{errors.customer_address.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Nota adicional (opcional)</Label>
              <textarea
                id="note"
                placeholder="¿Alguna indicación especial?"
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
                {...register('note')}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white font-semibold text-base py-5"
              style={{ backgroundColor: '#25D366' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar pedido por WhatsApp'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
