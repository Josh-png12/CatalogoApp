'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { CustomerForm } from '@/components/admin/CustomerForm'
import type { Customer } from '@/types'
import { useRouter } from 'next/navigation'

export function CustomerDetailClient({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
        style={{ borderColor: '#E8E6DF', color: '#374151' }}
      >
        <Pencil className="h-4 w-4" />
        Editar
      </button>
      <CustomerForm
        storeId={storeId}
        initialData={customer}
        open={open}
        onOpenChange={setOpen}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
