'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import { Users2, MessageCircle, Pencil, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConsultantForm } from '@/components/admin/ConsultantForm'
import { useToast } from '@/components/ui/toaster'
import type { Consultant } from '@/types'

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
}

function monthsAgo(dateStr?: string | null): string {
  if (!dateStr) return 'fecha desconocida'
  const diff = Date.now() - new Date(dateStr).getTime()
  const months = Math.floor(diff / (30 * 86400000))
  if (months === 0) return 'este mes'
  if (months === 1) return '1 mes'
  return `${months} meses`
}

interface SalesMap {
  [consultantId: string]: number
}

export default function EquipoPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const { toast } = useToast()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [salesMap, setSalesMap] = useState<SalesMap>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | undefined>()
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

    const [{ data: consultantsData }, { data: salesData }] = await Promise.all([
      supabase.from('consultants').select('*').eq('store_id', storeId).order('name'),
      supabase.from('sales').select('consultant_id, total').eq('store_id', storeId).gte('sale_date', monthStart).neq('status', 'cancelled'),
    ])

    setConsultants((consultantsData as Consultant[]) ?? [])

    const map: SalesMap = {}
    for (const sale of (salesData ?? [])) {
      if (sale.consultant_id) {
        map[sale.consultant_id] = (map[sale.consultant_id] ?? 0) + (sale.total ?? 0)
      }
    }
    setSalesMap(map)
    setLoading(false)
  }, [storeId])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleActive = async (consultant: Consultant) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('consultants')
      .update({ active: !consultant.active })
      .eq('id', consultant.id)
    if (error) { toast('Error al actualizar', 'error'); return }
    toast(consultant.active ? 'Consultora desactivada' : 'Consultora activada', 'success')
    fetchData()
  }

  const deleteConsultant = async (id: string) => {
    if (!confirm('¿Eliminar esta consultora?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('consultants').delete().eq('id', id)
    if (error) { toast('Error al eliminar', 'error') } else { toast('Consultora eliminada', 'success'); fetchData() }
    setDeleting(null)
  }

  const openEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditingConsultant(undefined)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi Equipo</h1>
          <p className="text-sm text-muted-foreground">{consultants.length} consultoras</p>
        </div>
        <Button onClick={openNew} className="gap-2 text-white" style={{ background: '#E91E8C' }}>
          <UserPlus className="h-4 w-4" />
          Agregar consultora
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Cargando equipo...</div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-16">
          <Users2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-700">Sin consultoras aún</p>
          <p className="text-sm text-muted-foreground mt-1">Agrega tu primera consultora</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultants.map((consultant) => {
            const salesThisMonth = salesMap[consultant.id] ?? 0
            const progress = consultant.monthly_goal > 0
              ? Math.min(100, Math.round((salesThisMonth / consultant.monthly_goal) * 100))
              : 0
            const goalMet = progress >= 100

            return (
              <div
                key={consultant.id}
                className="rounded-2xl border bg-white p-5 space-y-3"
                style={{ borderColor: '#E8E6DF', opacity: consultant.active ? 1 : 0.6 }}
              >
                {/* Avatar + Name */}
                <div className="flex items-start gap-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: '#E91E8C' }}
                  >
                    {initials(consultant.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{consultant.name}</p>
                    {consultant.phone && (
                      <p className="text-xs text-muted-foreground">{consultant.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      En equipo hace {monthsAgo(consultant.join_date)}
                    </p>
                  </div>
                  {/* WhatsApp */}
                  {(consultant.whatsapp || consultant.phone) && (
                    <a
                      href={`https://wa.me/57${((consultant.whatsapp ?? consultant.phone) ?? '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                      style={{ background: '#F0FDF4', color: '#16A34A' }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Sales progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ventas del mes</span>
                    <span className="font-medium" style={{ color: '#E91E8C' }}>{formatCOP(salesThisMonth)}</span>
                  </div>
                  {consultant.monthly_goal > 0 && (
                    <>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background: goalMet ? '#10B981' : '#E91E8C',
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Meta: {formatCOP(consultant.monthly_goal)}
                        </p>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={
                            goalMet
                              ? { background: '#DCFCE7', color: '#16A34A' }
                              : { background: '#F3F4F6', color: '#6B7280' }
                          }
                        >
                          {goalMet ? '🎉 Meta superada' : `${progress}% de la meta`}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#F5F4F0' }}>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(consultant)}
                    className="relative h-5 w-9 rounded-full transition-colors flex-shrink-0"
                    style={{ background: consultant.active ? '#10B981' : '#D1D5DB' }}
                    title={consultant.active ? 'Desactivar' : 'Activar'}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: consultant.active ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                  <span className="text-xs text-muted-foreground flex-1">
                    {consultant.active ? 'Activa' : 'Inactiva'}
                  </span>
                  <button
                    onClick={() => openEdit(consultant)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#374151' }}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteConsultant(consultant.id)}
                    disabled={deleting === consultant.id}
                    className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: '#EF4444' }}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConsultantForm
        storeId={storeId}
        initialData={editingConsultant}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchData}
      />
    </div>
  )
}
