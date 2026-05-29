import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Beauty by Angélica | Catálogo Digital',
  description: 'Catálogo de cosméticos premium con entrega a domicilio en Riohacha. Asesoría personalizada gratuita.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
