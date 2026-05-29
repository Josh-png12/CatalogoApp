'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ProductForm, type ProductSubmitData } from '@/components/admin/ProductForm'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/components/ui/toaster'
import { createClient } from '@/lib/supabase/client'

export default function NuevoProductoPage() {
  const router = useRouter()
  const { categories } = useCategories()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ProductSubmitData) => {
    setLoading(true)
    const supabase = createClient()
    const storeId = process.env.NEXT_PUBLIC_STORE_ID!

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        category_id: data.category_id || null,
        active: data.active,
        featured: data.featured,
      })
      .select('id')
      .single()

    if (error || !product) {
      toast('Error al crear el producto', 'error')
      setLoading(false)
      return
    }

    // Save images
    if (data.images.length > 0) {
      await supabase.from('product_images').insert(
        data.images.map((img, i) => ({
          product_id: product.id,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: i,
        }))
      )
    }

    // Save variants
    if (data.variants.length > 0) {
      await supabase.from('variants').insert(
        data.variants.map((v) => ({
          product_id: product.id,
          name: v.name,
          value: v.value,
          price_delta: v.price_delta,
          stock: v.stock,
        }))
      )
    }

    toast('Producto creado exitosamente')
    router.push('/admin/productos')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/admin/productos" className="hover:text-foreground transition-colors">Productos</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
      </div>
      <ProductForm categories={categories} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
