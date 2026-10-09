import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatRelativeTime } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { selectNotificationsOpen, notificationsToggled } from '../ui/uiSlice'
import {
  allNotificationsRead,
  notificationRemoved,
  notificationsCleared,
  selectFeed,
  selectUnreadCount,
} from './notificationsSlice'

const KIND_STYLE = {
  hit: { dot: 'bg-lime', label: 'Target hit' },
  triggered: { dot: 'bg-amber', label: 'Alert fired' },
}

function NotificationItem({ notification, now, onRemove }) {
  const style = KIND_STYLE[notification.kind] ?? KIND_STYLE.hit
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
      className="group hover:bg-ink-800 flex gap-3 rounded-xl p-3"
    >
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? 'bg-ink-500' : style.dot}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-ink-400 text-sm">{notification.message}</p>
        <p className="text-ink-500 mt-1 text-xs">
          {style.label} ·{' '}
          {formatRelativeTime(new Date(notification.createdAt).toISOString(), now)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(notification.id)}
        aria-label={`Dismiss ${notification.title}`}
        className="text-ink-500 hover:text-ink-100 self-start rounded-md px-1.5 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
      >
        ✕
      </button>
    </motion.li>
  )
}

export default function NotificationBell() {
  const dispatch = useDispatch()
  const open = useSelector(selectNotificationsOpen)
  const feed = useSelector(selectFeed)
  const unread = useSelector(selectUnreadCount)
  const now = useNow(30_000)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = () => dispatch(notificationsToggled(false))
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close()
    }
    const onKeyDown = (e) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, dispatch])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => dispatch(notificationsToggled())}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
        className="text-ink-300 hover:bg-ink-800 hover:text-ink-100 relative grid size-10 place-items-center rounded-xl transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-lime text-ink-950 absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            role="region"
            aria-label="Notifications"
            className="border-ink-700 bg-ink-900 absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  disabled={unread === 0}
                  onClick={() => dispatch(allNotificationsRead())}
                  className="text-ink-300 hover:text-lime disabled:opacity-40"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  disabled={feed.length === 0}
                  onClick={() => dispatch(notificationsCleared())}
                  className="text-ink-300 hover:text-down disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>
            {feed.length === 0 ? (
              <p className="text-ink-400 px-3 py-8 text-center text-sm">
                You’re all caught up. We’ll ping you when a target is hit.
              </p>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {feed.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      now={now}
                      onRemove={(id) => dispatch(notificationRemoved(id))}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
