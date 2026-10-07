import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/ui/Button'
import { PRICE_POLL_INTERVAL_MS } from '../../lib/config'
import { getErrorMessage } from '../../lib/errors'
import {
  useDeleteAlertMutation,
  useGetAlertsQuery,
  useUpdateAlertMutation,
} from '../../services/api'
import { alertFilterChanged, editorOpened, selectAlertFilter } from '../ui/uiSlice'
import AlertCard from './AlertCard'
import { selectAlertCounts, selectVisibleAlerts } from './selectors'

const FILTERS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['triggered', 'Triggered'],
]

const EMPTY_COPY = {
  all: ['No alerts yet', 'Create your first alert and we’ll watch the market for you.'],
  active: ['No active alerts', 'Everything has fired or is paused.'],
  triggered: [
    'Nothing has triggered yet',
    'Alerts that reach their target will show up here.',
  ],
}

export default function AlertsSection() {
  const dispatch = useDispatch()
  // Poll so alerts the backend fires (and deactivates) show up without a reload.
  const { isLoading, isError, error, refetch } = useGetAlertsQuery(undefined, {
    pollingInterval: PRICE_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  })
  const alerts = useSelector(selectVisibleAlerts)
  const counts = useSelector(selectAlertCounts)
  const filter = useSelector(selectAlertFilter)
  const [updateAlert] = useUpdateAlertMutation()
  const [deleteAlert] = useDeleteAlertMutation()
  const [pendingId, setPendingId] = useState(null)

  const handleEdit = useCallback(
    (alert) => dispatch(editorOpened({ alertId: alert.id })),
    [dispatch],
  )
  const handleToggle = useCallback(
    (alert) => updateAlert({ id: alert.id, is_active: !alert.is_active }),
    [updateAlert],
  )
  const handleDelete = useCallback(
    async (alert) => {
      setPendingId(alert.id)
      await deleteAlert(alert.id)
      setPendingId(null)
    },
    [deleteAlert],
  )

  const [emptyTitle, emptyCopy] = EMPTY_COPY[filter]

  return (
    <section aria-labelledby="alerts-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 id="alerts-heading" className="text-lg font-semibold tracking-tight">
            Your alerts
          </h2>
          {counts.hit > 0 && (
            <span className="bg-lime text-ink-950 rounded-full px-2.5 py-0.5 text-xs font-bold">
              {counts.hit} hit
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => dispatch(editorOpened())}>
          + New alert
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Filter alerts"
        className="bg-ink-900 mb-5 flex gap-1 rounded-xl p-1 sm:w-fit"
      >
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => dispatch(alertFilterChanged(value))}
            className={clsx(
              'relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              filter === value ? 'text-ink-100' : 'text-ink-400 hover:text-ink-200',
            )}
          >
            {filter === value && (
              <motion.span
                layoutId="filter-pill"
                className="bg-ink-700 absolute inset-0 rounded-lg"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">
              {label}{' '}
              <span className="text-ink-400 font-mono text-xs">{counts[value]}</span>
            </span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="border-ink-700 bg-ink-900/60 h-48 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="border-down/30 bg-down/5 rounded-2xl border p-6 text-center"
        >
          <p className="text-down">
            {getErrorMessage(error, 'Could not load your alerts.')}
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-ink-600 rounded-2xl border border-dashed px-6 py-14 text-center"
        >
          <p className="font-medium">{emptyTitle}</p>
          <p className="text-ink-400 mt-1">{emptyCopy}</p>
          {filter === 'all' && (
            <Button className="mt-5" onClick={() => dispatch(editorOpened())}>
              Create an alert
            </Button>
          )}
        </motion.div>
      )}

      <ul className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              busy={pendingId === alert.id}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
