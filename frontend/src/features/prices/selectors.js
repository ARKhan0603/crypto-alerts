import { createSelector } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const selectPricesResult = api.endpoints.getCryptocurrencies.select()

export const selectCoins = createSelector(
  selectPricesResult,
  (result) => result.data ?? [],
)

/** symbol → { symbol, name, price, updatedAt } built from the RTK Query cache. */
export const selectPricesBySymbol = createSelector(selectCoins, (coins) =>
  Object.fromEntries(
    coins.map((coin) => [
      coin.symbol,
      {
        symbol: coin.symbol,
        name: coin.name,
        price: coin.last_price === null ? null : Number(coin.last_price),
        updatedAt: coin.last_price_at,
      },
    ]),
  ),
)
