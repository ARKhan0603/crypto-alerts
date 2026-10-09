import { PRICE_POLL_INTERVAL_MS } from '../../lib/constants'
import { useGetCryptocurrenciesQuery } from '../../services/api'

/** Live prices: cached by RTK Query and refetched in the background every 20 seconds. */
export function usePrices() {
  return useGetCryptocurrenciesQuery(undefined, {
    pollingInterval: PRICE_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
    refetchOnReconnect: true,
  })
}
