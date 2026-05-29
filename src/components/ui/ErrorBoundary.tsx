'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="font-medium text-gray-800 mb-2" style={{ fontSize: 18 }}>
              Algo salió mal
            </p>
            <p className="text-gray-400 mb-6" style={{ fontSize: 14 }}>
              Por favor recarga la página
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--brand)', borderRadius: 0 }}
            >
              Recargar
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
