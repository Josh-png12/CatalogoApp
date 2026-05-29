interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="w-8 h-0.5 rounded mb-2" style={{ background: '#E91E8C' }} />
        <h2
          className="text-xl md:text-2xl font-medium text-gray-900"
          style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: '#E91E8C' }}
        >
          {actionLabel} →
        </button>
      )}
    </div>
  )
}
