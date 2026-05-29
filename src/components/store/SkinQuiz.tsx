'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProductCard } from '@/components/store/ProductCard'
import { useStoreConfig } from '@/context/StoreConfigContext'
import type { Product } from '@/types'

const TONES = [
  { label: 'Muy claro',   bg: '#FDDBB4', value: 'Muy claro' },
  { label: 'Claro',       bg: '#EFC070', value: 'Claro' },
  { label: 'Medio claro', bg: '#D4956A', value: 'Medio claro' },
  { label: 'Medio',       bg: '#B87641', value: 'Medio' },
  { label: 'Oscuro',      bg: '#7D4E2D', value: 'Oscuro' },
  { label: 'Muy oscuro',  bg: '#4A2B1A', value: 'Muy oscuro' },
]

const SKIN_TYPES = [
  { emoji: '💧', label: 'Seca',    desc: 'Se siente tirante, especialmente después de lavar', value: 'Seca' },
  { emoji: '🫧', label: 'Grasa',   desc: 'Brilla, especialmente en la frente y nariz',         value: 'Grasa' },
  { emoji: '⚖️', label: 'Mixta',   desc: 'Grasa en la zona T, normal en mejillas',             value: 'Mixta' },
  { emoji: '✨', label: 'Normal',  desc: 'Bien equilibrada, sin problemas particulares',        value: 'Normal' },
]

const CONCERNS = ['Hidratación', 'Manchas', 'Poros', 'Brillo excesivo', 'Líneas finas', 'Acné']

interface Props {
  products: Product[]
}

export function SkinQuiz({ products }: Props) {
  const config = useStoreConfig()
  const [open, setOpen]           = useState(false)
  const [step, setStep]           = useState(1)
  const [tone, setTone]           = useState('')
  const [skinType, setSkinType]   = useState('')
  const [concerns, setConcerns]   = useState<string[]>([])
  const [loading, setLoading]     = useState(false)
  const [results, setResults]     = useState<Product[] | null>(null)

  const reset = () => {
    setStep(1); setTone(''); setSkinType(''); setConcerns([])
    setLoading(false); setResults(null)
  }

  const handleClose = () => { reset(); setOpen(false) }

  const toggleConcern = (c: string) => {
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const handleFinish = () => {
    setLoading(true)
    setStep(4)
    const keywords = [tone, skinType, ...concerns].map((s) => s.toLowerCase())
    const matched = products.filter((p) => {
      const text = `${p.name} ${p.description ?? ''} ${p.category?.name ?? ''}`.toLowerCase()
      return keywords.some((kw) => text.includes(kw))
    })
    const recommended = matched.length >= 2 ? matched.slice(0, 4) : products.slice(0, 4)
    setTimeout(() => { setResults(recommended); setLoading(false) }, 1500)
  }

  const waUrl = config.whatsapp_number
    ? `https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(
        `Hola ${config.consultant_name ?? 'Angélica'}! Hice el quiz y tengo tono ${tone}, piel ${skinType}. Me gustaría que me recomiendes productos 💄`
      )}`
    : '#'

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 2, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => { reset(); setOpen(true) }}
        className="fixed z-40 flex items-center gap-2 font-medium shadow-lg"
        style={{
          bottom: 24,
          left: 24,
          background: 'var(--warm-dark)',
          color: 'white',
          borderRadius: 28,
          padding: '12px 20px',
          fontSize: 13,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#2d1520' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--warm-dark)' }}
      >
        🎨 ¿Cuál es tu tono?
      </motion.button>

      <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
        <SheetContent side="bottom" className="flex flex-col p-0" style={{ maxHeight: '92vh' }}>
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Quiz de belleza personalizado</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-6">
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-all duration-500"
                    style={{ background: s < step || (step === 4 && s <= 3) ? 'var(--brand)' : '#e5e7eb' }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Tone */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="font-medium text-gray-900 mb-6" style={{ fontSize: 18 }}>
                      ¿Cuál describe mejor tu tono de piel?
                    </p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {TONES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTone(t.value)}
                          className="flex flex-col items-center gap-2 p-3 transition-all"
                          style={{
                            border: tone === t.value ? '2px solid var(--brand)' : '2px solid transparent',
                            borderRadius: 12,
                            background: tone === t.value ? 'var(--brand-light)' : '#f9fafb',
                          }}
                        >
                          <div
                            className="relative rounded-full flex items-center justify-center"
                            style={{ width: 52, height: 52, background: t.bg }}
                          >
                            {tone === t.value && (
                              <span className="text-white font-bold" style={{ fontSize: 18 }}>✓</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: '#4b5563' }}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={!tone}
                      onClick={() => setStep(2)}
                      className="w-full uppercase font-medium disabled:opacity-40"
                      style={{
                        fontSize: 12,
                        letterSpacing: '1px',
                        padding: '13px 0',
                        background: 'var(--brand)',
                        color: 'white',
                        borderRadius: 0,
                      }}
                    >
                      Continuar
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Skin type */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="font-medium text-gray-900 mb-6" style={{ fontSize: 18 }}>
                      ¿Cuál es tu tipo de piel?
                    </p>
                    <div className="space-y-3 mb-6">
                      {SKIN_TYPES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setSkinType(s.value)}
                          className="w-full flex items-center gap-4 p-4 text-left transition-all"
                          style={{
                            border: skinType === s.value ? '2px solid var(--brand)' : '1px solid #e5e7eb',
                            borderRadius: 12,
                            background: skinType === s.value ? 'var(--brand-light)' : 'white',
                          }}
                        >
                          <span style={{ fontSize: 24 }}>{s.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900" style={{ fontSize: 14 }}>{s.label}</p>
                            <p style={{ fontSize: 12, color: '#9ca3af' }}>{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        style={{ flex: 1, fontSize: 12, letterSpacing: '1px', padding: '12px 0', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 0, background: 'white' }}
                      >
                        ATRÁS
                      </button>
                      <button
                        disabled={!skinType}
                        onClick={() => setStep(3)}
                        className="disabled:opacity-40"
                        style={{ flex: 2, fontSize: 12, letterSpacing: '1px', padding: '12px 0', background: 'var(--brand)', color: 'white', borderRadius: 0 }}
                      >
                        CONTINUAR
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Concerns */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="font-medium text-gray-900 mb-2" style={{ fontSize: 18 }}>
                      ¿Cuál es tu mayor preocupación?
                    </p>
                    <p className="text-gray-400 mb-6" style={{ fontSize: 13 }}>
                      Puedes seleccionar varias
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {CONCERNS.map((c) => {
                        const sel = concerns.includes(c)
                        return (
                          <button
                            key={c}
                            onClick={() => toggleConcern(c)}
                            style={{
                              fontSize: 13,
                              padding: '8px 16px',
                              border: sel ? '2px solid var(--brand)' : '1px solid #e5e7eb',
                              borderRadius: 20,
                              background: sel ? 'var(--brand-light)' : 'white',
                              color: sel ? 'var(--brand)' : '#4b5563',
                              fontWeight: sel ? 500 : 400,
                            }}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        style={{ flex: 1, fontSize: 12, padding: '12px 0', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 0, background: 'white' }}
                      >
                        ATRÁS
                      </button>
                      <button
                        onClick={handleFinish}
                        style={{ flex: 2, fontSize: 12, letterSpacing: '1px', padding: '12px 0', background: 'var(--brand)', color: 'white', borderRadius: 0 }}
                      >
                        VER RESULTADOS
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Results */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="dots-pulse flex gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" style={{ background: 'var(--brand)' }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" style={{ background: 'var(--brand)' }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" style={{ background: 'var(--brand)' }} />
                        </div>
                        <p style={{ fontSize: 14, color: '#9ca3af' }}>Analizando tu perfil de belleza…</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-center mb-6">
                          <p
                            style={{
                              fontFamily: 'var(--font-editorial)',
                              fontSize: 24,
                              marginBottom: 8,
                            }}
                          >
                            Tu perfil de belleza
                          </p>
                          <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: 'var(--brand-light)', fontSize: 13, color: 'var(--brand)' }}
                          >
                            Tono {tone} · Piel {skinType}
                            {concerns.length > 0 && ` · ${concerns.slice(0, 2).join(', ')}`}
                          </div>
                        </div>

                        <p className="font-medium text-gray-700 mb-4" style={{ fontSize: 14 }}>
                          Productos recomendados para ti
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {(results ?? []).map((p) => (
                            <ProductCard key={p.id} product={p} />
                          ))}
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => { handleClose(); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) }}
                            className="w-full uppercase font-medium"
                            style={{ fontSize: 12, letterSpacing: '1px', padding: '13px 0', background: 'var(--brand)', color: 'white', borderRadius: 0 }}
                          >
                            Ver todos los productos para mi piel
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center uppercase font-medium"
                            style={{ fontSize: 12, letterSpacing: '1px', padding: '13px 0', background: '#25D366', color: 'white', borderRadius: 0 }}
                          >
                            Pedir asesoría personalizada
                          </a>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
