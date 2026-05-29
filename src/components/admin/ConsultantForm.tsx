'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Consultant } from '@/types'

interface ConsultantFormProps {
  storeId: string
  initialData?: Partial<Consultant>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ConsultantForm({ storeId, initialData, open, onOpenChange, onSaved }: ConsultantFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    phone: initialData?.phone ?? '',
    whatsapp: initialData?.whatsapp ?? '',
    email: initialData?.email ?? '',
    address: initialData?.address ?? '',
    join_date: initialData?.join_date ?? new Date().toISOString().slice(0, 10),
    monthly_goal: initialData?.monthly_goal ?? 0,
    commission_rate: initialData?.commission_rate ?? 10,
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
  })

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast('El nombre es requerido', 'error'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        store_id: storeId,
        name: form.name.trim(),
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        address: form.address || null,
        join_date: form.join_date || null,
        monthly_goal: Number(form.monthly_goal) || 0,
        commission_rate: Number(form.commission_rate) || 0,
        notes: form.notes || null,
        active: form.active,
      }
      if (initialData?.id) {
        const { error } = await supabase.from('consultants').update(payload).eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('consultants').insert(payload)
        if (error) throw error
      }
      toast(initialData?.id ? 'Consultora actualizada' : 'Consultora agregada', 'success')
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData?.id ? 'Editar consultora' : 'Nueva consultora'}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre completo" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="3001234567" />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="3001234567" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="consultora@email.com" />
          </div>

          <div className="space-y-1">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Dirección..." />
          </div>

          <div className="space-y-1">
            <Label>Fecha de ingreso</Label>
            <Input type="date" value={form.join_date} onChange={(e) => set('join_date', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Meta mensual (COP)</Label>
              <Input
                type="number"
                min={0}
                value={form.monthly_goal || ''}
                onChange={(e) => set('monthly_goal', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Comisión (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.commission_rate || ''}
                onChange={(e) => set('commission_rate', Number(e.target.value))}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notas</Label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('active', !form.active)}
              className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
              style={{ background: form.active ? '#10B981' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: form.active ? 'translateX(20px)' : 'translateX(2px)' }}
              />
            </button>
            <Label>Activa en el equipo</Label>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full text-white"
            style={{ background: '#E91E8C' }}
          >
            {saving ? 'Guardando...' : initialData?.id ? 'Actualizar consultora' : 'Agregar consultora'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
