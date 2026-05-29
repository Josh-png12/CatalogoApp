'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

interface CategoryRow {
  id: string
  name: string
  slug: string
  sort_order: number
  product_count?: number
}

export default function CategoriasPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [saving, setSaving] = useState(false)
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })

    if (!cats) { setLoading(false); return }

    // Get product counts
    const { data: counts } = await supabase
      .from('products')
      .select('category_id')
      .eq('store_id', storeId)

    const countMap: Record<string, number> = {}
    for (const p of counts ?? []) {
      if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
    }

    setCategories(cats.map((c) => ({ ...c, product_count: countMap[c.id] ?? 0 })))
    setLoading(false)
  }, [storeId])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('categories').insert({
      store_id: storeId,
      name: name.trim(),
      slug: slugify(name.trim()),
      sort_order: sortOrder ? Number(sortOrder) : (categories.length + 1),
    })
    if (error) {
      toast('Error al crear la categoría', 'error')
    } else {
      toast('Categoría creada')
      setName('')
      setSortOrder('')
      fetchCategories()
    }
    setSaving(false)
  }

  const handleDelete = async (cat: CategoryRow) => {
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) {
      toast('Error al eliminar la categoría', 'error')
    } else {
      toast('Categoría eliminada')
      fetchCategories()
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="text-sm text-muted-foreground">Organiza tus productos por categoría</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm font-medium">Nueva categoría</p>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="cat-name" className="text-xs text-muted-foreground">Nombre *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Cuidado de la piel"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="w-24 space-y-1">
              <Label htmlFor="cat-order" className="text-xs text-muted-foreground">Orden</Label>
              <Input
                id="cat-order"
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          {name && (
            <p className="text-xs text-muted-foreground">Slug: <code className="bg-muted px-1 rounded">{slugify(name)}</code></p>
          )}
          <Button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="bg-brand hover:bg-brand-dark text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar categoría
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No hay categorías aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Orden: {cat.sort_order} · {cat.product_count} producto{cat.product_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (cat.product_count && cat.product_count > 0) {
                      if (!confirm(`Esta categoría tiene ${cat.product_count} producto(s). Al eliminarla, quedarán sin categoría. ¿Continuar?`)) return
                    }
                    handleDelete(cat)
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
