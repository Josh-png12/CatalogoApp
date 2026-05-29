import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { orderSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  const { success } = rateLimit(request, 5, 60_000)
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un momento.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const result = orderSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: result.error.issues },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const { data, error } = await supabase
    .from('orders')
    .insert({
      store_id: storeId,
      customer_name:    result.data.customer_name,
      customer_phone:   result.data.customer_phone ?? null,
      customer_address: result.data.customer_address,
      items:            result.data.items,
      total:            result.data.total,
      notes:            result.data.notes ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
