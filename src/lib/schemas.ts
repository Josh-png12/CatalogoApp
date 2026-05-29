import { z } from 'zod'

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nombre muy corto').max(100).trim(),
  customer_phone: z
    .string()
    .regex(/^[0-9\s\+\-\(\)]{7,15}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  customer_address: z.string().min(3, 'Dirección muy corta').max(200).trim(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        product_name: z.string().max(200),
        quantity: z.number().int().min(1).max(100),
        unit_price: z.number().positive().max(10_000_000),
        total: z.number().positive(),
      })
    )
    .min(1)
    .max(50),
  total: z.number().positive().max(100_000_000),
  notes: z.string().max(500).optional(),
})

export const reviewSchema = z.object({
  reviewer_name: z.string().min(2).max(100).trim(),
  reviewer_phone: z.string().max(20).optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).trim().optional(),
  skin_type: z.string().max(50).optional(),
  skin_tone: z.string().max(50).optional(),
  product_id: z.string().uuid(),
  store_id: z.string().uuid(),
})

export const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  message: z.string().min(5).max(2000).trim(),
})

export type OrderInput   = z.infer<typeof orderSchema>
export type ReviewInput  = z.infer<typeof reviewSchema>
export type ContactInput = z.infer<typeof contactSchema>
