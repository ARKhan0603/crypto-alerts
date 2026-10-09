import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { PRICE_FLASH_COLORS } from '../../lib/constants'
import { formatPrice, formatRelativeTime } from '../../lib/format'
import { getCoinColor } from './coinStyle'

/** Direction of the last price change, tracked during render (no effect, no ref reads). */
function usePriceDirection(price) {
  const [state, setState] = useState({ price, direction: 0 })
  if (price !== state.price) {
    const direction =
      price == null || state.price == null ? 0 : Math.sign(price - state.price)
    setState({ price, direction: direction || state.direction })
  }
  return state.direction
}

export default function PriceCard({ coin, hitCount = 0, index = 0, onCreateAlert }) {
  const direction = usePriceDirection(coin.price)
  const color = getCoinColor(coin.symbol)
  const flash =
    direction > 0
      ? PRICE_FLASH_COLORS.UP
      : direction < 0
        ? PRICE_FLASH_COLORS.DOWN
        : PRICE_FLASH_COLORS.NEUTRAL

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      aria-label={`${coin.name} price`}
      className={clsx(
        'group bg-ink-900/80 relative overflow-hidden rounded-2xl border p-5 backdrop-blur',
        hitCount > 0
          ? 'border-lime/60 shadow-glow'
          : 'border-ink-700 hover:border-ink-600',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
        style={{ background: color }}
      />
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 place-items-center rounded-xl font-mono text-xs font-bold"
            style={{ background: `${color}22`, color }}
          >
            {coin.symbol.slice(0, 4)}
          </span>
          <div>
            <h3 className="leading-tight font-medium">{coin.name}</h3>
            <p className="text-ink-400 font-mono text-xs">{coin.symbol}/USD</p>
          </div>
        </div>
        {hitCount > 0 && (
          <span
            className="animate-pulse-ring bg-lime text-ink-950 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            title="A price target was reached"
          >
            <span className="bg-ink-950 size-1.5 rounded-full" />
            {hitCount} hit
          </span>
        )}
      </header>

      <div className="mt-6 flex items-end justify-between">
        <motion.p
          key={coin.price}
          initial={{ color: flash }}
          animate={{ color: PRICE_FLASH_COLORS.NEUTRAL }}
          transition={{ duration: 1.6 }}
          className="font-mono text-2xl font-semibold tracking-tight tabular-nums"
        >
          {formatPrice(coin.price)}
        </motion.p>
        {direction !== 0 && (
          <span
            aria-label={direction > 0 ? 'Price rose' : 'Price fell'}
            className={clsx('text-lg', direction > 0 ? 'text-up' : 'text-down')}
          >
            {direction > 0 ? '▲' : '▼'}
          </span>
        )}
      </div>

      <footer className="text-ink-400 mt-4 flex items-center justify-between text-xs">
        <span>Updated {formatRelativeTime(coin.updatedAt)}</span>
        <button
          type="button"
          onClick={() => onCreateAlert(coin.symbol)}
          className="text-ink-300 hover:text-lime rounded-md font-medium transition-colors"
        >
          + Set alert
        </button>
      </footer>
    </motion.article>
  )
}
