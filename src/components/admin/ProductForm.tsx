'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageUploader, type UploadedImage } from '@/components/admin/ImageUploader'
import { formatCOP } from '@/lib/utils'
import type { Product, Category, Variant } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'Stock no puede ser negativo'),
  category_id: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
})

type BaseFormData = z.infer<typeof schema>

export interface VariantInput {
  id?: string
  name: string
  value: string
  price_delta: number
  stock: number
}

export interface ProductSubmitData extends BaseFormData {
  images: UploadedImage[]
  variants: VariantInput[]
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
  onSubmit: (data: ProductSubmitData) => Promise<void>
  loading?: boolean
}

const emptyVariant = { name: '', value: '', price_delta: 0, stock: 0 }

export function ProductForm({ product, categories, onSubmit, loading }: ProductFormProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    product?.images?.map((img) => ({ url: img.url, is_primary: img.is_primary, dbId: img.id })) ?? []
  )
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants?.map((v: Variant) => ({
      id: v.id, name: v.name, value: v.value, price_delta: v.price_delta, stock: v.stock,
    })) ?? []
  )
  const [newVariant, setNewVariant] = useState(emptyVariant)

  const { register, handleSubmit, formState: { errors } } = useForm<BaseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category_id: product?.category_id ?? '',
      active: product?.active ?? true,
      featured: product?.featured ?? false,
    },
  })

  const addVariant = () => {
    if (!newVariant.name.trim() || !newVariant.value.trim()) return
    setVariants((v) => [...v, { ...newVariant }])
    setNewVariant(emptyVariant)
  }

  const removeVariant = (idx: number) => setVariants((v) => v.filter((_, i) => i !== idx))

  const handleFormSubmit = async (base: BaseFormData) => {
    await onSubmit({ ...base, images, variants })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Sección 1 — Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Ej: Sérum TimeWise Repair" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Descripción del producto..."
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input id="price" type="number" min="0" step="100" {...register('price')} aria-invalid={!!errors.price} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" {...register('stock')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              {...register('category_id')}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" className="rounded accent-brand" {...register('active')} />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" className="rounded accent-brand" {...register('featured')} />
              Destacado
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2 — Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Imágenes</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            productId={product?.id}
            initialImages={images}
            onChange={setImages}
          />
        </CardContent>
      </Card>

      {/* Sección 3 — Variantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Variantes (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2">
                  <span className="flex-1">
                    <span className="font-medium">{v.name}: {v.value}</span>
                    {v.price_delta !== 0 && (
                      <span className="text-muted-foreground ml-2">
                        ({v.price_delta > 0 ? '+' : ''}{formatCOP(v.price_delta)})
                      </span>
                    )}
                    <span className="text-muted-foreground ml-2">· Stock: {v.stock}</span>
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeVariant(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tipo (ej: Color)</Label>
              <Input
                placeholder="Color"
                value={newVariant.name}
                onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor (ej: Rojo)</Label>
              <Input
                placeholder="Rojo"
                value={newVariant.value}
                onChange={(e) => setNewVariant((v) => ({ ...v, value: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Diferencia de precio</Label>
              <Input
                type="number"
                step="100"
                placeholder="0"
                value={newVariant.price_delta}
                onChange={(e) => setNewVariant((v) => ({ ...v, price_delta: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock variante</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={newVariant.stock}
                onChange={(e) => setNewVariant((v) => ({ ...v, stock: Number(e.target.value) }))}
              />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Agregar variante
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1 bg-brand hover:bg-brand-dark text-white">
          {loading ? 'Guardando...' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  )
}
