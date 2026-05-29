'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Truck, MessageCircle, Banknote } from 'lucide-react'

const benefits = [
  {
    icon: ShieldCheck,
    color: '#E91E8C',
    title: '100% Originales',
    text: 'Todos nuestros productos son directamente de la marca',
  },
  {
    icon: Truck,
    color: '#E91E8C',
    title: 'Entrega a domicilio',
    text: 'Llevamos tus productos hasta la puerta de tu casa en Riohacha',
  },
  {
    icon: MessageCircle,
    color: '#25D366',
    title: 'Asesoría gratuita',
    text: 'Angélica te ayuda a elegir los productos perfectos para ti',
  },
  {
    icon: Banknote,
    color: '#C9A84C',
    title: 'Paga al recibir',
    text: 'No necesitas pagar en línea, paga cuando recibas tu pedido',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-10 md:py-16 px-4 md:px-6 lg:px-8" style={{ background: '#FAFAF8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-5"
              style={{ border: '0.5px solid #E8E6DF' }}
            >
              <div
                className="flex items-center justify-center rounded-full mb-3"
                style={{ width: 44, height: 44, background: `${b.color}18` }}
              >
                <b.icon style={{ width: 22, height: 22, color: b.color }} />
              </div>
              <p className="font-medium" style={{ fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>
                {b.title}
              </p>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{b.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
