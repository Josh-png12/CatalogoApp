'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Star, X, Upload } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= rating ? '#C9A84C' : '#e5e7eb' }}>
          ★
        </span>
      ))}
    </div>
  )
}

function RatingBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 11, color: '#6b7280', width: 20, textAlign: 'right' }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: '#f3f4f6' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'var(--brand)' }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af', width: 32 }}>{pct}%</span>
    </div>
  )
}

interface Props {
  productId: string
  productName: string
}

export function ReviewsSection({ productId, productName }: Props) {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const fetchReviews = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
    setReviews((data ?? []) as Review[])
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [productId])

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const dist = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length
    return { star, pct: reviews.length ? Math.round((n / reviews.length) * 100) : 0 }
  })

  return (
    <section className="mt-12 pt-10" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
        {/* Average */}
        <div className="text-center md:text-left flex-shrink-0">
          <p
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1,
              color: '#1a1a1a',
            }}
          >
            {avg || '—'}
          </p>
          <Stars rating={Math.round(avg)} size={18} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            Basado en {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2 max-w-xs">
          {dist.map((d) => <RatingBar key={d.star} label={`${d.star}★`} pct={d.pct} />)}
        </div>

        {/* CTA */}
        <div className="md:ml-auto">
          <button
            onClick={() => setFormOpen(true)}
            className="font-medium uppercase transition-all"
            style={{
              fontSize: 12,
              letterSpacing: '1px',
              padding: '12px 24px',
              background: 'var(--brand)',
              color: 'white',
              borderRadius: 0,
              border: 'none',
            }}
          >
            Deja tu reseña
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400" style={{ fontSize: 14 }}>
          Cargando reseñas…
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            Sé la primera en dejar una reseña de {productName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl p-4"
              style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {r.photo_url && (
                <button
                  onClick={() => setLightbox(r.photo_url!)}
                  className="block w-full mb-3 overflow-hidden rounded-lg"
                  style={{ aspectRatio: '4/3' }}
                >
                  <Image
                    src={r.photo_url}
                    alt="Foto de reseña"
                    width={400}
                    height={300}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                </button>
              )}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900" style={{ fontSize: 13 }}>
                    {r.reviewer_name}
                    {r.verified && (
                      <span className="ml-1.5" style={{ fontSize: 10, color: 'var(--brand)' }}>✓ Verificada</span>
                    )}
                  </p>
                  <Stars rating={r.rating} size={11} />
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  {new Date(r.created_at).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {r.comment && (
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, marginBottom: 8 }}>
                  {r.comment}
                </p>
              )}
              {(r.skin_type || r.skin_tone) && (
                <p style={{ fontSize: 11, color: 'var(--brand)' }}>
                  {[r.skin_type, r.skin_tone].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-2xl max-h-[90vh] w-full mx-4">
            <Image
              src={lightbox}
              alt="Foto reseña"
              width={800}
              height={600}
              className="object-contain w-full h-full rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Review Form Sheet */}
      <ReviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        productId={productId}
        storeId={storeId}
        onSuccess={() => { setFormOpen(false); fetchReviews() }}
      />
    </section>
  )
}

function ReviewForm({
  open,
  onClose,
  productId,
  storeId,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  productId: string
  storeId: string
  onSuccess: () => void
}) {
  const [step, setStep]           = useState(1)
  const [rating, setRating]       = useState(0)
  const [hover, setHover]         = useState(0)
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [skinType, setSkinType]   = useState('')
  const [skinTone, setSkinTone]   = useState('')
  const [comment, setComment]     = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep(1); setRating(0); setHover(0)
    setName(''); setPhone(''); setSkinType(''); setSkinTone('')
    setComment(''); setPhotoFile(null); setPreviewUrl(null)
    setSubmitting(false); setSuccess(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('La foto no puede superar 5 MB'); return }
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim() || rating === 0) return
    setSubmitting(true)
    const supabase = createClient()

    let photo_url: string | null = null
    if (photoFile) {
      const path = `${storeId}/reviews/${Date.now()}_${photoFile.name}`
      const { data: upData } = await supabase.storage
        .from('product-images')
        .upload(path, photoFile, { upsert: true })
      if (upData) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(upData.path)
        photo_url = publicUrl
      }
    }

    await supabase.from('reviews').insert({
      store_id: storeId,
      product_id: productId,
      reviewer_name: name.trim(),
      reviewer_phone: phone.trim() || null,
      rating,
      comment: comment.trim() || null,
      skin_type: skinType || null,
      skin_tone: skinTone || null,
      photo_url,
      approved: false,
    })

    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => { reset(); onSuccess() }, 2500)
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <SheetContent side="bottom" className="flex flex-col p-0 max-h-[92vh]">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Deja tu reseña</SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div style={{ fontSize: 48 }}>✅</div>
            <p className="font-medium text-gray-900" style={{ fontSize: 18 }}>
              ¡Gracias por tu reseña!
            </p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Tu reseña será publicada después de ser verificada.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-6 py-6 space-y-6">
              {/* Progress bar */}
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: s <= step ? 'var(--brand)' : '#e5e7eb' }}
                  />
                ))}
              </div>

              {step === 1 && (
                <div>
                  <p className="font-medium text-gray-900 mb-4" style={{ fontSize: 16 }}>
                    ¿Cómo calificarías este producto?
                  </p>
                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(s)}
                        style={{
                          fontSize: 36,
                          color: s <= (hover || rating) ? '#C9A84C' : '#e5e7eb',
                          background: 'none',
                          border: 'none',
                          transition: 'color 150ms, transform 150ms',
                          transform: s <= (hover || rating) ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={rating === 0}
                    onClick={() => setStep(2)}
                    className="w-full uppercase font-medium transition-all disabled:opacity-40"
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="font-medium text-gray-900 mb-2" style={{ fontSize: 16 }}>
                    Tu información
                  </p>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 12 }}>
                      Nombre *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full outline-none"
                      style={{
                        fontSize: 14,
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 0,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 12 }}>
                      Teléfono (opcional)
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Para verificar que eres clienta"
                      className="w-full outline-none"
                      style={{
                        fontSize: 14,
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 0,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: 12 }}>
                        Tipo de piel
                      </label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full outline-none bg-white"
                        style={{ fontSize: 13, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 0 }}
                      >
                        <option value="">Seleccionar</option>
                        {['Normal', 'Grasa', 'Seca', 'Mixta', 'Sensible'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: 12 }}>
                        Tono de piel
                      </label>
                      <select
                        value={skinTone}
                        onChange={(e) => setSkinTone(e.target.value)}
                        className="w-full outline-none bg-white"
                        style={{ fontSize: 13, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 0 }}
                      >
                        <option value="">Seleccionar</option>
                        {['Muy claro', 'Claro', 'Medio', 'Oscuro', 'Muy oscuro'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 uppercase font-medium"
                      style={{ fontSize: 12, letterSpacing: '1px', padding: '12px 0', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 0, background: 'white' }}
                    >
                      Atrás
                    </button>
                    <button
                      disabled={!name.trim()}
                      onClick={() => setStep(3)}
                      className="flex-1 uppercase font-medium disabled:opacity-40"
                      style={{ fontSize: 12, letterSpacing: '1px', padding: '12px 0', background: 'var(--brand)', color: 'white', borderRadius: 0 }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="font-medium text-gray-900 mb-2" style={{ fontSize: 16 }}>
                    Tu experiencia
                  </p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos tu experiencia con este producto..."
                    rows={4}
                    className="w-full outline-none resize-none"
                    style={{
                      fontSize: 14,
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 0,
                      lineHeight: 1.6,
                    }}
                  />
                  {/* Photo upload */}
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                  {previewUrl ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="relative rounded-full overflow-hidden flex-shrink-0"
                        style={{ width: 64, height: 64 }}
                      >
                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#4b5563' }}>{photoFile?.name}</p>
                        <button
                          onClick={() => { setPhotoFile(null); setPreviewUrl(null) }}
                          className="text-red-400 hover:text-red-600"
                          style={{ fontSize: 12 }}
                        >
                          Eliminar foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 transition-colors"
                      style={{
                        fontSize: 13,
                        padding: '10px 16px',
                        border: '1px dashed #d1d5db',
                        color: '#6b7280',
                        borderRadius: 0,
                        background: 'transparent',
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      <Upload className="h-4 w-4" />
                      Agregar foto (opcional, máx 5 MB)
                    </button>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      style={{ fontSize: 12, letterSpacing: '1px', padding: '12px 0', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 0, background: 'white', flex: 1 }}
                    >
                      ATRÁS
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="uppercase font-medium disabled:opacity-60"
                      style={{
                        fontSize: 12,
                        letterSpacing: '1px',
                        padding: '12px 0',
                        background: 'var(--brand)',
                        color: 'white',
                        borderRadius: 0,
                        flex: 2,
                      }}
                    >
                      {submitting ? 'Enviando…' : 'Enviar reseña'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
