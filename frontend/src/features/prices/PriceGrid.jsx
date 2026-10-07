import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/ui/Button'
import { getErrorMessage } from '../../lib/errors'
import { selectHitCountBySymbol } from '../alerts/selectors'
import { editorOpened } from '../ui/uiSlice'
import PriceCard from './PriceCard'
import { selectPricesBySymbol } from './selectors'
import { usePrices } from './usePrices'

function PriceSkeleton() {
  return (
    <div className="border-ink-700 bg-ink-900/60 h-[168px] animate-pulse rounded-2xl border" />
  )
}

export default function PriceGrid() {
  const dispatch = useDispatch()
  const { isLoading, isError, error, refetch } = usePrices()
  const prices = useSelector(selectPricesBySymbol)
  const hitCounts = useSelector(selectHitCountBySymbol)
  const coins = Object.values(prices)

  return (
    <section aria-labelledby="prices-heading">
      <h2 id="prices-heading" className="mb-4 text-lg font-semibold tracking-tight">
        Live prices
      </h2>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PriceSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && coins.length === 0 && (
        <div
          role="alert"
          className="border-down/30 bg-down/5 rounded-2xl border p-6 text-center"
        >
          <p className="text-down">{getErrorMessage(error, 'Could not load prices.')}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && coins.length === 0 && (
        <p className="border-ink-600 text-ink-400 rounded-2xl border border-dashed p-8 text-center">
          No cryptocurrencies are available yet.
        </p>
      )}

      {coins.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coins.map((coin, index) => (
            <PriceCard
              key={coin.symbol}
              coin={coin}
              index={index}
              hitCount={hitCounts[coin.symbol] ?? 0}
              onCreateAlert={(symbol) => dispatch(editorOpened({ symbol }))}
            />
          ))}
        </div>
      )}
    </section>
  )
}
