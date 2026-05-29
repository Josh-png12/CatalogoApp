'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import { PackagePlus, Package, AlertTriangle, DollarSign, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryEntryForm } from '@/components/admin/InventoryEntryForm'
import { useToast } from '@/components/ui/toaster'
import type { Product, InventoryMovement } from '@/types'

const FILTER_TABS = ['Todos', 'En stock', 'Stock bajo', 'Agotados']

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: '#E8E6DF' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function InventarioPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Todos')
  const [entryOpen, setEntryOpen] = useState(false)
  const [preselectedId, setPreselectedId] = useState<string | undefined>()
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, price, stock, category_id, active')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('name')
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [storeId])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openEntry = (productId?: string) => {
    setPreselectedId(productId)
    setEntryOpen(true)
  }

  const openHistory = async (product: Product) => {
    setHistoryProduct(product)
    const supabase = createClient()
    const { data } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setMovements((data as InventoryMovement[]) ?? [])
    setHistoryOpen(true)
  }

  const totalProducts = products.length
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  const filtered = products.filter((p) => {
    if (activeTab === 'En stock') return p.stock > 5
    if (activeTab === 'Stock bajo') return p.stock > 0 && p.stock <= 5
    if (activeTab === 'Agotados') return p.stock === 0
    return true
  })

  const stockColor = (stock: number) => {
    if (stock === 0) return '#DC2626'
    if (stock <= 5) return '#D97706'
    return '#16A34A'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-sm text-muted-foreground">{totalProducts} productos activos</p>
        </div>
        <Button
          onClick={() => openEntry()}
          className="gap-2 text-white"
          style={{ background: '#E91E8C' }}
        >
          <PackagePlus className="h-4 w-4" />
          Registrar entrada
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total productos" value={totalProducts} icon={Package} color="#E91E8C" />
        <StatCard title="Valor inventario" value={formatCOP(inventoryValue)} icon={DollarSign} color="#10B981" />
        <StatCard title="Alertas stock bajo" value={lowStockCount} icon={AlertTriangle} color="#F59E0B" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={
              activeTab === tab
                ? { background: '#E91E8C', color: '#fff' }
                : { background: '#F3F4F6', color: '#6B7280' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#E8E6DF' }}>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Cargando inventario...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium text-gray-700">Sin productos en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#F5F4F0' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Valor inventario</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#F5F4F0' }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          color: stockColor(product.stock),
                          background: `${stockColor(product.stock)}18`,
                        }}
                      >
                        {product.stock === 0 ? 'Agotado' : product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-600">
                      {formatCOP(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell font-medium" style={{ color: '#10B981' }}>
                      {formatCOP(product.price * product.stock)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEntry(product.id)}
                          className="h-8 px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          style={{ background: '#EFF6FF', color: '#2563EB' }}
                          title="Registrar entrada"
                        >
                          <PackagePlus className="h-3.5 w-3.5" />
                          Entrada
                        </button>
                        <button
                          onClick={() => openHistory(product)}
                          className="h-8 px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          style={{ background: '#F3F4F6', color: '#374151' }}
                          title="Ver historial"
                        >
                          <History className="h-3.5 w-3.5" />
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Entry Form */}
      <InventoryEntryForm
        storeId={storeId}
        preselectedProductId={preselectedId}
        open={entryOpen}
        onOpenChange={setEntryOpen}
        onSaved={fetchProducts}
      />

      {/* History Modal */}
      {historyOpen && historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setHistoryOpen(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">Historial: {historyProduct.name}</p>
                <p className="text-xs text-muted-foreground">Últimos 30 movimientos</p>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin movimientos registrados</p>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl border text-sm"
                    style={{ borderColor: '#F5F4F0' }}
                  >
                    <div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium mr-2"
                        style={
                          m.type === 'entry'
                            ? { background: '#DCFCE7', color: '#16A34A' }
                            : { background: '#FEF3C7', color: '#D97706' }
                        }
                      >
                        {m.type === 'entry' ? 'Entrada' : 'Ajuste'}
                      </span>
                      <span className="text-gray-700">+{m.quantity} unidades</span>
                      {m.reason && <span className="text-xs text-muted-foreground ml-2">({m.reason})</span>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {m.previous_stock} → {m.new_stock}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
