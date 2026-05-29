'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { Copy, Check, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

const catalogUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const USES = [
  { icon: '📱', text: 'Ponlo en tu bio de Instagram' },
  { icon: '🖨️', text: 'Imprímelo en tus tarjetas de presentación' },
  { icon: '💬', text: 'Compártelo en grupos de WhatsApp' },
  { icon: '🏪', text: 'Colócalo en tu punto de venta' },
]

export default function CompartirPage() {
  const { toast } = useToast()
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [copiedIg, setCopiedIg] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(catalogUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyIg = async () => {
    await navigator.clipboard.writeText(catalogUrl)
    setCopiedIg(true)
    toast('Link copiado — pégalo en Instagram')
    setTimeout(() => setCopiedIg(false), 2000)
  }

  const handleDownload = () => {
    if (!canvasWrapperRef.current) return
    const canvas = canvasWrapperRef.current.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'beauty-qr.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast('QR descargado')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Comparte tu catálogo</h1>
        <p className="text-sm text-muted-foreground">
          Tu link público y código QR para que tus clientas accedan directamente.
        </p>
      </div>

      {/* Link section */}
      <div className="rounded-2xl border bg-white p-5 space-y-3" style={{ borderColor: '#E8E6DF' }}>
        <p className="font-medium text-sm text-gray-700">Link del catálogo</p>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono truncate"
            style={{ background: '#FAFAF8', border: '0.5px solid #E8E6DF', color: '#6b7280' }}
          >
            {catalogUrl}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 gap-1.5"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? '¡Copiado!' : 'Copiar'}
          </Button>
        </div>
      </div>

      {/* QR section */}
      <div className="rounded-2xl border bg-white p-5 space-y-5" style={{ borderColor: '#E8E6DF' }}>
        <p className="font-medium text-sm text-gray-700">Código QR</p>

        {/* Visible SVG QR */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl border" style={{ borderColor: '#FCE4F3', background: '#FFF0F7' }}>
            <QRCodeSVG
              value={catalogUrl}
              size={220}
              fgColor="#E91E8C"
              bgColor="#ffffff"
              level="M"
              includeMargin
            />
          </div>
        </div>

        {/* Hidden high-res canvas for download */}
        <div ref={canvasWrapperRef} style={{ display: 'none' }}>
          <QRCodeCanvas
            value={catalogUrl}
            size={480}
            fgColor="#E91E8C"
            bgColor="#ffffff"
            level="M"
            includeMargin
          />
        </div>

        <Button
          onClick={handleDownload}
          className="w-full gap-2 text-white"
          style={{ background: '#E91E8C' }}
        >
          <Download className="h-4 w-4" />
          Descargar QR como PNG
        </Button>

        {/* Uses */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: '#FAFAF8' }}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cómo usarlo</p>
          {USES.map((u, i) => (
            <p key={i} className="text-sm text-gray-600">
              <span className="mr-2">{u.icon}</span>{u.text}
            </p>
          ))}
        </div>
      </div>

      {/* Share section */}
      <div className="rounded-2xl border bg-white p-5 space-y-3" style={{ borderColor: '#E8E6DF' }}>
        <p className="font-medium text-sm text-gray-700">Compartir directo</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hola! Te comparto mi catálogo de productos: ${catalogUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ background: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.829L.057 23.8l6.122-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.006-1.37l-.36-.214-3.633.952.969-3.542-.235-.374A9.845 9.845 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.414-4.405 9.818-9.818 9.818z"/>
            </svg>
            Compartir en WhatsApp
          </a>

          <button
            onClick={handleCopyIg}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E8E6DF', color: '#6b7280' }}
          >
            {copiedIg ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            Copiar para Instagram
          </button>

          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E8E6DF', color: '#6b7280' }}
          >
            <ExternalLink className="h-4 w-4" />
            Ver mi catálogo
          </a>
        </div>
      </div>
    </div>
  )
}
