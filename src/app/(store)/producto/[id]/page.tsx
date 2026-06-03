import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/getStoreConfig'
import { ProductDetail } from '@/components/store/ProductDetail'
import type { Product } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [supabase, config] = await Promise.all([createClient(), getStoreConfig()])
  const { data } = await supabase
    .from('products')
    .select('name, description, seo_title, seo_description, images:product_images(*)')
    .eq('id', id)
    .single()

  if (!data) return {}

  const storeName = config?.store_name ?? 'Beauty'
  const title = data.seo_title ?? `${data.name}`
  const description =
    data.seo_description ?? data.description ?? `${data.name} disponible en ${storeName}`
  const img = (data.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)
    ?? (data.images as { url: string }[])?.[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: img?.url ? [img.url] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*), category:categories(*)')
    .eq('id', id)
    .eq('store_id', storeId)
    .single()

  if (!data) notFound()

  // Fetch up to 4 related products from the same category
  let relatedProducts: Product[] = []
  if (data.category_id) {
    const { data: related } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants(*), category:categories(*)')
      .eq('store_id', storeId)
      .eq('category_id', data.category_id)
      .eq('active', true)
      .neq('id', id)
      .limit(4)
    relatedProducts = (related ?? []) as unknown as Product[]
  }

  return <ProductDetail product={data as unknown as Product} relatedProducts={relatedProducts} />
}
