import clsx from 'clsx'
import { ALERT_STATUS, STATUS_BADGES } from '../../lib/constants'

export default function StatusBadge({ status }) {
  const { label, className } =
    STATUS_BADGES[status] ?? STATUS_BADGES[ALERT_STATUS.WATCHING]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        className,
      )}
    >
      {status === ALERT_STATUS.WATCHING && (
        <span className="bg-up size-1.5 rounded-full" />
      )}
      {label}
    </span>
  )
}
