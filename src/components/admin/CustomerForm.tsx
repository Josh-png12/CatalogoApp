'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Customer } from '@/types'

interface CustomerFormProps {
  storeId: string
  initialData?: Partial<Customer>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const SKIN_TYPES = ['Normal', 'Seca', 'Grasa', 'Mixta', 'Sensible']
const SKIN_TONES = ['Clara', 'Media', 'Oscura']
const ALL_TAGS = ['VIP', 'Frecuente', 'Nueva', 'Inactiva']

export function CustomerForm({ storeId, initialData, open, onOpenChange, onSaved }: CustomerFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    phone: initialData?.phone ?? '',
    whatsapp: initialData?.whatsapp ?? '',
    address: initialData?.address ?? '',
    neighborhood: initialData?.neighborhood ?? '',
    city: initialData?.city ?? 'Riohacha',
    birthday: initialData?.birthday ?? '',
    skin_type: initialData?.skin_type ?? '',
    skin_tone: initialData?.skin_tone ?? '',
    notes: initialData?.notes ?? '',
    tags: initialData?.tags ?? [] as string[],
  })

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('El nombre es requerido', 'error')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        store_id: storeId,
        name: form.name.trim(),
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        city: form.city || 'Riohacha',
        birthday: form.birthday || null,
        skin_type: form.skin_type || null,
        skin_tone: form.skin_tone || null,
        notes: form.notes || null,
        tags: form.tags,
        ...(initialData?.id ? {} : { total_spent: 0, active: true }),
      }
      if (initialData?.id) {
        const { error } = await supabase.from('customers').update(payload).eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('customers').insert(payload)
        if (error) throw error
      }
      toast(initialData?.id ? 'Cliente actualizado' : 'Cliente creado', 'success')
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
          <SheetTitle>{initialData?.id ? 'Editar cliente' : 'Nueva cliente'}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre completo" />
          </div>

          {/* Phone + WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Ej: 3001234567" />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="Ej: 3001234567" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle, carrera..." />
          </div>

          {/* Neighborhood + City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Barrio</Label>
              <Input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Barrio" />
            </div>
            <div className="space-y-1">
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Riohacha" />
            </div>
          </div>

          {/* Birthday */}
          <div className="space-y-1">
            <Label>Fecha de cumpleaños</Label>
            <Input type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)} />
          </div>

          {/* Skin type + tone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo de piel</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={form.skin_type}
                onChange={(e) => set('skin_type', e.target.value)}
              >
                <option value="">Seleccionar</option>
                {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Tono de piel</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={form.skin_tone}
                onChange={(e) => set('skin_tone', e.target.value)}
              >
                <option value="">Seleccionar</option>
                {SKIN_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={
                    form.tags.includes(tag)
                      ? { background: '#E91E8C', color: '#fff', borderColor: '#E91E8C' }
                      : { background: 'transparent', color: '#6b7280', borderColor: '#E8E6DF' }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas</Label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Preferencias, alergias, observaciones..."
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full text-white"
            style={{ background: '#E91E8C' }}
          >
            {saving ? 'Guardando...' : initialData?.id ? 'Actualizar cliente' : 'Crear cliente'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
