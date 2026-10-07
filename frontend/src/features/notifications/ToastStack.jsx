import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToasts, toastDismissed } from './notificationsSlice'

const STYLES = {
  hit: { bar: 'bg-lime', ring: 'border-lime/50 shadow-glow', icon: '◎' },
  triggered: { bar: 'bg-amber', ring: 'border-amber/40', icon: '⚡' },
  info: { bar: 'bg-up', ring: 'border-ink-600', icon: '✓' },
  error: { bar: 'bg-down', ring: 'border-down/40', icon: '!' },
}

const DURATION_MS = { hit: 9000, triggered: 9000, info: 3500, error: 6000 }

function Toast({ toast, onDismiss }) {
  const style = STYLES[toast.kind] ?? STYLES.info

  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.kind] ?? 5000)
    return () => clearTimeout(id)
  }, [toast.id, toast.kind, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -48, transition: { duration: 0.18 } }}
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className={`bg-ink-800/95 pointer-events-auto relative flex w-80 max-w-full gap-3 overflow-hidden rounded-2xl border p-4 pl-5 backdrop-blur ${style.ring}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
      <span className="text-ink-100 font-mono text-lg leading-none" aria-hidden="true">
        {style.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="text-ink-300 mt-0.5 text-sm">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-ink-400 hover:text-ink-100 self-start"
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function ToastStack() {
  const dispatch = useDispatch()
  const toasts = useSelector(selectToasts)
  // Stable identity so each toast's auto-dismiss timer isn't reset by re-renders.
  const dismiss = useCallback((id) => dispatch(toastDismissed(id)), [dispatch])

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col items-start gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
