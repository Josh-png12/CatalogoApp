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
  const storeId    = process.env.NEXT_PUBLIC_STORE_ID
  const categoryId = searchParams.get('category_id')
  const featured   = searchParams.get('featured')

  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, images:product_images(*), variants(*), category:categories(*)')
    .eq('store_id', storeId!)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (featured === 'true') query = query.eq('featured', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
