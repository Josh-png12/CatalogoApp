'use client'

import { useState, useEffect } from 'react'

interface PromoBadgeProps {
  label: string
  discountText: string
  endsAt?: string | null
}

function getTimeLeft(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function pad(n: number) { return String(n).padStart(2, '0') }

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000

export function PromoBadge({ label, discountText, endsAt }: PromoBadgeProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    endsAt ? getTimeLeft(endsAt) : null
  )

  const showCountdown =
    !!endsAt &&
    !!timeLeft &&
    new Date(endsAt).getTime() - Date.now() < FORTY_EIGHT_HOURS

  useEffect(() => {
    if (!endsAt) return
    const id = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <div className="flex flex-col items-start gap-0.5">
      <div
        className="rounded-full px-2.5 py-1 flex flex-col items-center"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #E91E8C)' }}
      >
        <span
          className="text-white font-bold uppercase leading-none"
          style={{ fontSize: 9, letterSpacing: '0.05em' }}
        >
          {label}
        </span>
        <span className="text-white font-bold leading-none" style={{ fontSize: 13 }}>
          {discountText}
        </span>
      </div>
      {showCountdown && timeLeft && (
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: '#FEF08A', color: '#92400E' }}
        >
          {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
        </span>
      )}
    </div>
  )
}
