import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  const { success } = rateLimit(request, 30, 60_000)
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un momento.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('store_id') ?? process.env.NEXT_PUBLIC_STORE_ID

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId!)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
