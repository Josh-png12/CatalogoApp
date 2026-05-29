'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ExpenseFormProps {
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const CATEGORIES = [
  { value: 'mercancia',    label: '📦 Compra mercancía' },
  { value: 'domicilios',   label: '🚗 Domicilios' },
  { value: 'publicidad',   label: '📱 Publicidad' },
  { value: 'local',        label: '🏠 Local/arriendo' },
  { value: 'transporte',   label: '🚌 Transporte' },
  { value: 'otros',        label: '📝 Otros' },
]

const PAYMENT_METHODS = [
  { value: 'efectivo',       label: 'Efectivo' },
  { value: 'nequi',          label: 'Nequi' },
  { value: 'daviplata',      label: 'Daviplata' },
  { value: 'transferencia',  label: 'Transferencia' },
]

export function ExpenseForm({ storeId, open, onOpenChange, onSaved }: ExpenseFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState('mercancia')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setCategory('mercancia')
    setDescription('')
    setAmount('')
    setExpenseDate(new Date().toISOString().slice(0, 10))
    setPaymentMethod('efectivo')
    setNotes('')
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) resetForm()
    onOpenChange(o)
  }

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) { toast('Ingresa un monto válido', 'error'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('expenses').insert({
        store_id: storeId,
        category,
        description: description || null,
        amount: Number(amount),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        notes: notes || null,
      })
      if (error) throw error
      toast('Gasto registrado', 'success')
      onSaved()
      handleOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar gasto</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4 mt-2">
          {/* Category */}
          <div className="space-y-1">
            <Label>Categoría</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Descripción</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle del gasto..."
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label>Monto (COP) *</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Fecha</Label>
            <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className="px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                  style={
                    paymentMethod === pm.value
                      ? { borderColor: '#E91E8C', background: '#FDF2F8', color: '#E91E8C' }
                      : { borderColor: '#E8E6DF', color: '#374151' }
                  }
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas (opcional)</Label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full text-white"
            style={{ background: '#E91E8C' }}
          >
            {saving ? 'Guardando...' : 'Registrar gasto'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
