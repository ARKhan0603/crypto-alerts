import { useSelector } from 'react-redux'
import Button from './ui/Button'
import Logo from './ui/Logo'
import { selectUsername } from '../features/auth/authSlice'
import { useLogoutMutation } from '../services/api'
import { usePrices } from '../features/prices/usePrices'
import { formatRelativeTime } from '../lib/format'
import { useNow } from '../lib/useNow'
import NotificationBell from '../features/notifications/NotificationBell'

function LiveIndicator() {
  const { data, isFetching, isError } = usePrices()
  const now = useNow(5_000)
  const latest = data?.reduce(
    (max, c) => (c.last_price_at > max ? c.last_price_at : max),
    '',
  )

  return (
    <div
      className="text-ink-400 hidden items-center gap-2 text-sm sm:flex"
      aria-live="polite"
    >
      <span
        className={`size-2 rounded-full ${isError ? 'bg-down' : 'bg-up'} ${isFetching ? 'animate-pulse' : ''}`}
      />
      {isError
        ? 'Offline'
        : latest
          ? `Live · ${formatRelativeTime(latest, now)}`
          : 'Connecting…'}
    </div>
  )
}

export default function AppHeader() {
  const username = useSelector(selectUsername)
  const [logout, { isLoading }] = useLogoutMutation()

  return (
    <header className="border-ink-800 bg-ink-950/80 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-4">
          <LiveIndicator />
          <NotificationBell />
          <div className="border-ink-700 flex items-center gap-3 border-l pl-4">
            <span className="text-ink-300 hidden text-sm sm:inline">{username}</span>
            <Button
              variant="ghost"
              size="sm"
              loading={isLoading}
              onClick={() => logout()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
