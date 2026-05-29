'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ExpenseForm } from '@/components/admin/ExpenseForm'
import { useRouter } from 'next/navigation'

export function FinanzasClient({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: '#E91E8C' }}
      >
        <Plus className="h-4 w-4" />
        Registrar gasto
      </button>
      <ExpenseForm
        storeId={storeId}
        open={open}
        onOpenChange={setOpen}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
