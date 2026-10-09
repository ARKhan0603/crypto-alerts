import { COIN_COLORS, DEFAULT_COIN_COLOR } from '../../lib/constants'

export const getCoinColor = (symbol) => COIN_COLORS[symbol] ?? DEFAULT_COIN_COLOR
