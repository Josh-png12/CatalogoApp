import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProductClient } from '@/components/admin/EditProductClient'
import type { Product, Category } from '@/types'

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const supabase = await createClient()

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), variants(*)')
      .eq('id', id)
      .eq('store_id', storeId)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true }),
  ])

  if (!productResult.data) notFound()

  return (
    <EditProductClient
      product={productResult.data as unknown as Product}
      categories={(categoriesResult.data ?? []) as Category[]}
    />
  )
}
