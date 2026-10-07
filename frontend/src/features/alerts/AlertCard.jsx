import clsx from 'clsx'
import { motion } from 'framer-motion'
import { memo } from 'react'
import Button from '../../components/ui/Button'
import { formatPercent, formatPrice, formatRelativeTime } from '../../lib/format'
import { getProgress } from '../../lib/alertLogic'
import { getCoinColor } from '../prices/coinStyle'
import StatusBadge from './StatusBadge'

function AlertCard({ alert, onEdit, onDelete, onToggle, busy }) {
  const { status } = alert
  const color = getCoinColor(alert.symbol)
  const isHit = status === 'hit'
  const isTriggered = status === 'triggered'
  const progress = getProgress(alert.distance)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={clsx(
        'bg-ink-900/80 rounded-2xl border p-5 backdrop-blur',
        isHit ? 'border-lime/60 shadow-glow' : 'border-ink-700',
        (isTriggered || status === 'paused') && 'opacity-80',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-xl font-mono text-xs font-bold"
            style={{ background: `${color}22`, color }}
          >
            {alert.symbol.slice(0, 4)}
          </span>
          <div>
            <p className="font-medium">
              {alert.coinName}{' '}
              <span className="text-ink-400">
                {alert.alert_type === 'above' ? 'rises above' : 'falls below'}
              </span>
            </p>
            <p className="font-mono text-xl font-semibold tabular-nums">
              {formatPrice(alert.target)}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-5">
        <div
          role="progressbar"
          aria-label="Progress to target"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="bg-ink-700 h-1.5 overflow-hidden rounded-full"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
              'h-full rounded-full',
              isHit || isTriggered ? 'bg-lime' : 'bg-ink-300',
            )}
          />
        </div>
        <div className="text-ink-400 mt-2 flex justify-between text-sm">
          <span>
            Now <span className="text-ink-200 font-mono">{formatPrice(alert.price)}</span>
          </span>
          <span>
            {isTriggered
              ? `Fired ${formatRelativeTime(alert.triggered_at)}`
              : alert.distance === null
                ? '—'
                : alert.distance <= 0
                  ? 'Target reached'
                  : `${formatPercent(alert.distance, { signed: false })} away`}
          </span>
        </div>
      </div>

      <div className="border-ink-800 mt-4 flex justify-end gap-2 border-t pt-4">
        {!isTriggered && (
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onToggle(alert)}
            >
              {alert.is_active ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => onEdit(alert)}
            >
              Edit
            </Button>
          </>
        )}
        <Button
          variant="danger"
          size="sm"
          disabled={busy}
          aria-label={`Delete ${alert.symbol} alert`}
          onClick={() => onDelete(alert)}
        >
          Delete
        </Button>
      </div>
    </motion.li>
  )
}

export default memo(AlertCard)
