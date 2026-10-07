import clsx from 'clsx'

const STATUS = {
  hit: { label: 'Target hit', className: 'bg-lime text-ink-950 animate-pulse-ring' },
  watching: { label: 'Watching', className: 'bg-ink-700 text-ink-200' },
  triggered: {
    label: 'Triggered',
    className: 'bg-amber/15 text-amber border border-amber/30',
  },
  paused: { label: 'Paused', className: 'bg-ink-800 text-ink-400 border border-ink-600' },
}

export default function StatusBadge({ status }) {
  const { label, className } = STATUS[status] ?? STATUS.watching
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        className,
      )}
    >
      {status === 'watching' && <span className="bg-up size-1.5 rounded-full" />}
      {label}
    </span>
  )
}
