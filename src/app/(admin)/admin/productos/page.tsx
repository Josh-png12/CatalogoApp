'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import type { Product, Category } from '@/types'

const PAGE_SIZE = 20

type ProductRow = Product & { category: Category | null }

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase
      .from('products')
      .select('*, category:categories(id,store_id,name,slug,sort_order), images:product_images(id,product_id,url,sort_order,is_primary)', { count: 'exact' })
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .range(from, to)

    setProducts((data as unknown as ProductRow[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, storeId])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleField = async (id: string, field: 'active' | 'featured', current: boolean) => {
    const supabase = createClient()
    await supabase.from('products').update({ [field]: !current }).eq('id', id)
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    setDeleting(false)
    fetchProducts()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">{total} productos en total</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark text-white">
          <Link href="/admin/productos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-muted-foreground">
            <Package className="h-12 w-12 opacity-20" />
            <p className="font-medium">No tienes productos aún</p>
            <Button asChild className="bg-brand hover:bg-brand-dark text-white">
              <Link href="/admin/productos/nuevo">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer producto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Producto</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 font-medium text-muted-foreground">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Precio</th>
                  <th className="hidden sm:table-cell text-center px-4 py-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Activo</th>
                  <th className="hidden sm:table-cell text-center px-4 py-3 font-medium text-muted-foreground">Destacado</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const imgs = p.images as unknown as Array<{ url: string; is_primary: boolean }>
                  const img = imgs?.find((i) => i.is_primary) ?? imgs?.[0]
                  return (
                    <tr key={p.id} className="bg-white hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? (
                              <Image src={img.url} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <span className="font-medium truncate max-w-[160px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                        {p.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCOP(p.price)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-center">
                        <Badge variant={p.stock > 0 ? 'secondary' : 'destructive'}>
                          {p.stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleField(p.id, 'active', p.active)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.active ? 'bg-brand' : 'bg-muted-foreground/30'}`}
                          aria-label="Toggle activo"
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${p.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-center">
                        <button
                          onClick={() => toggleField(p.id, 'featured', p.featured)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.featured ? 'bg-brand' : 'bg-muted-foreground/30'}`}
                          aria-label="Toggle destacado"
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${p.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                            <Link href={`/admin/productos/${p.id}/editar`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Página {page + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se eliminará <span className="font-medium text-foreground">{deleteTarget?.name}</span> permanentemente,
            incluyendo sus imágenes y variantes. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
