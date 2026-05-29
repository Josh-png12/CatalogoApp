'use client'

import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (id: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const tabs = [{ id: null, name: 'Todo' }, ...categories]

  return (
    <div
      className="sticky z-30 bg-white overflow-x-auto"
      style={{
        top: 56,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="flex" style={{ minWidth: 'max-content' }}>
        {tabs.map((tab) => {
          const active = selected === tab.id
          return (
            <button
              key={tab.id ?? 'all'}
              onClick={() => onChange(tab.id)}
              className="whitespace-nowrap uppercase outline-none cursor-pointer transition-colors"
              style={{
                fontSize: 11,
                letterSpacing: '1px',
                padding: '14px 20px',
                borderRadius: 0,
                border: 'none',
                borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                color: active ? '#1a1a1a' : '#9ca3af',
                fontWeight: active ? 500 : 400,
                background: 'transparent',
                marginBottom: -1,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#4b5563'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#9ca3af'
              }}
            >
              {tab.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
