'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { ProductForm, type ProductSubmitData } from '@/components/admin/ProductForm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types'

interface EditProductClientProps {
  product: Product
  categories: Category[]
}

export function EditProductClient({ product, categories }: EditProductClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [savingSeo, setSavingSeo] = useState(false)
  const [seoTitle, setSeoTitle] = useState(product.seo_title ?? '')
  const [seoDesc, setSeoDesc] = useState(product.seo_description ?? '')

  const handleSubmit = async (data: ProductSubmitData) => {
    setLoading(true)
    const supabase = createClient()

    // Update product base fields
    const { error } = await supabase
      .from('products')
      .update({
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        category_id: data.category_id || null,
        active: data.active,
        featured: data.featured,
      })
      .eq('id', product.id)

    if (error) {
      toast('Error al actualizar el producto', 'error')
      setLoading(false)
      return
    }

    // Replace images: delete old, insert new (only those not already in DB)
    const existingDbIds = data.images.filter((i) => i.dbId).map((i) => i.dbId!)
    // Delete images removed by user
    const originalIds = product.images?.map((i) => i.id) ?? []
    const toDelete = originalIds.filter((id) => !existingDbIds.includes(id))
    if (toDelete.length > 0) {
      await supabase.from('product_images').delete().in('id', toDelete)
    }
    // Insert new images (no dbId means freshly uploaded)
    const newImages = data.images.filter((i) => !i.dbId)
    if (newImages.length > 0) {
      const currentCount = existingDbIds.length
      await supabase.from('product_images').insert(
        newImages.map((img, i) => ({
          product_id: product.id,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: currentCount + i,
        }))
      )
    }
    // Update is_primary on existing images
    for (const img of data.images.filter((i) => i.dbId)) {
      await supabase.from('product_images').update({ is_primary: img.is_primary }).eq('id', img.dbId!)
    }

    // Replace variants
    const keptVariantIds = data.variants.filter((v) => v.id).map((v) => v.id!)
    const originalVariantIds = product.variants?.map((v) => v.id) ?? []
    const variantsToDelete = originalVariantIds.filter((id) => !keptVariantIds.includes(id))
    if (variantsToDelete.length > 0) {
      await supabase.from('variants').delete().in('id', variantsToDelete)
    }
    const newVariants = data.variants.filter((v) => !v.id)
    if (newVariants.length > 0) {
      await supabase.from('variants').insert(
        newVariants.map((v) => ({
          product_id: product.id,
          name: v.name,
          value: v.value,
          price_delta: v.price_delta,
          stock: v.stock,
        }))
      )
    }

    toast('Producto actualizado')
    router.push('/admin/productos')
  }

  const handleSaveSeo = async () => {
    setSavingSeo(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
      })
      .eq('id', product.id)
    setSavingSeo(false)
    if (error) toast('Error al guardar SEO', 'error')
    else toast('SEO guardado')
  }

  const storeName = process.env.NEXT_PUBLIC_STORE_ID ? 'Beauty' : 'Beauty'
  const snippetTitle = seoTitle || `${product.name}`
  const snippetDesc = seoDesc || product.description || `${product.name} disponible en ${storeName}`

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/admin/productos" className="hover:text-foreground transition-colors">Productos</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>
        <h1 className="text-2xl font-bold">Editar producto</h1>
      </div>
      <ProductForm
        product={product}
        categories={categories}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* SEO section */}
      <div className="border rounded-xl overflow-hidden">
        <button
          onClick={() => setSeoOpen(!seoOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-muted/40 hover:bg-muted transition-colors"
        >
          <span>SEO del producto</span>
          {seoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {seoOpen && (
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_title">Título SEO</Label>
                <span className="text-xs text-muted-foreground">{snippetTitle.length}/60</span>
              </div>
              <Input
                id="seo_title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${product.name} — Beauty`}
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_desc">Meta descripción</Label>
                <span className="text-xs text-muted-foreground">{snippetDesc.length}/160</span>
              </div>
              <textarea
                id="seo_desc"
                rows={3}
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder={product.description ?? `Descripción de ${product.name}`}
                maxLength={160}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
              />
            </div>

            {/* Google snippet preview */}
            <div className="rounded-lg border bg-white p-3 space-y-1 font-sans">
              <p className="text-xs text-green-700">beauty-angelica.vercel.app/producto/{product.id.slice(0, 8)}...</p>
              <p className="text-[#1a0dab] text-sm leading-snug line-clamp-1">{snippetTitle}</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{snippetDesc}</p>
            </div>

            <Button
              className="w-full text-white"
              style={{ backgroundColor: 'var(--brand-500)' }}
              disabled={savingSeo}
              onClick={handleSaveSeo}
            >
              {savingSeo ? 'Guardando...' : 'Guardar SEO del producto'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
