import { createClient } from '@/lib/supabase/server'
import { PromotionList } from '@/components/admin/PromotionList'

export default async function PromocionesPage() {
  const supabase = await createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const now = new Date().toISOString()

  const [promoRes, productsRes] = await Promise.all([
    supabase
      .from('promotions')
      .select('*, product:products(id, name, price, images:product_images(url, is_primary))')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, name, price')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('name', { ascending: true }),
  ])

  return (
    <PromotionList
      initialPromotions={(promoRes.data ?? []) as never}
      products={(productsRes.data ?? []) as never}
      storeId={storeId}
      now={now}
    />
  )
}
