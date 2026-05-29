'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface UploadedImage {
  url: string
  is_primary: boolean
  dbId?: string
}

interface ImageUploaderProps {
  productId?: string
  initialImages?: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

const MAX_IMAGES = 5
const MAX_SIZE_MB = 5
const MAX_DIM = 800
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM }
        else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/jpeg', 0.85)
    }
    img.onerror = reject
    img.src = url
  })
}

export function ImageUploader({ productId, initialImages = [], onChange }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const update = (next: UploadedImage[]) => {
    setImages(next)
    onChange(next)
  }

  const uploadFile = async (file: File) => {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      alert(`Solo se permiten imágenes JPG, PNG o WebP.`)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`El archivo ${file.name} supera los ${MAX_SIZE_MB}MB.`)
      return
    }
    const supabase = createClient()
    const ts = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const folder = productId ? `${storeId}/${productId}` : `${storeId}/temp`
    const path = `${folder}/${ts}-${safeName}`

    const resized = await resizeImage(file)
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, resized, { contentType: 'image/jpeg', upsert: false })

    if (error || !data) return

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || images.length >= MAX_IMAGES) return
    const allowed = Array.from(files).slice(0, MAX_IMAGES - images.length)
    setUploading(true)
    const urls: UploadedImage[] = []
    for (const file of allowed) {
      if (!file.type.startsWith('image/')) continue
      const url = await uploadFile(file)
      if (url) urls.push({ url, is_primary: images.length === 0 && urls.length === 0 })
    }
    update([...images, ...urls])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeImage = async (idx: number) => {
    const img = images[idx]
    const supabase = createClient()
    // Extract path from URL to delete from Storage
    try {
      const url = new URL(img.url)
      const parts = url.pathname.split('/object/public/product-images/')
      if (parts[1]) {
        await supabase.storage.from('product-images').remove([decodeURIComponent(parts[1])])
      }
    } catch {
      // If URL parsing fails, just remove from state
    }
    const next = images.filter((_, i) => i !== idx)
    if (img.is_primary && next.length > 0) next[0].is_primary = true
    update(next)
  }

  const setPrimary = (idx: number) => {
    update(images.map((img, i) => ({ ...img, is_primary: i === idx })))
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={img.url} className="relative group w-20 h-20">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                <Image
                  src={img.url}
                  alt={`Imagen ${idx + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              {img.is_primary && (
                <span className="absolute bottom-1 left-1 bg-brand text-white text-[10px] px-1.5 py-0.5 rounded font-medium leading-none">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="bg-white/90 rounded-full p-1 hover:bg-white"
                    title="Marcar como principal"
                  >
                    <Star className="w-3 h-3 text-brand" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-white/90 rounded-full p-1 hover:bg-white"
                  title="Eliminar"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <label
          className={`block cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragOver ? 'border-brand bg-brand-light/50' : 'border-border hover:border-brand/50 hover:bg-muted/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Subiendo...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP · máx. {MAX_SIZE_MB}MB · hasta {MAX_IMAGES} imágenes
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}
