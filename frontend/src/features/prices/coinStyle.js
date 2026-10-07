/** Brand-ish hue per coin so cards are scannable at a glance. Falls back to lime. */
const COIN_COLORS = {
  BTC: '#f7931a',
  ETH: '#8a9bff',
  XRP: '#4fd1e8',
  ADA: '#3d8bff',
  SOL: '#19e3b1',
  DOGE: '#e9c46a',
}

export const getCoinColor = (symbol) => COIN_COLORS[symbol] ?? '#c6f24e'
