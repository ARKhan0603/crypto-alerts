export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const PRICE_POLL_INTERVAL_MS = 20_000

export const STORAGE_KEYS = {
  token: 'tickr.token',
  username: 'tickr.username',
}

export const ALERT_TYPES = { ABOVE: 'above', BELOW: 'below' }

export const ALERT_TYPE_OPTIONS = [
  { value: ALERT_TYPES.ABOVE, label: 'Above', icon: '▲' },
  { value: ALERT_TYPES.BELOW, label: 'Below', icon: '▼' },
]

export const ALERT_STATUS = {
  HIT: 'hit',
  WATCHING: 'watching',
  TRIGGERED: 'triggered',
  PAUSED: 'paused',
}

export const STATUS_BADGES = {
  [ALERT_STATUS.HIT]: {
    label: 'Target hit',
    className: 'bg-lime text-ink-950 animate-pulse-ring',
  },
  [ALERT_STATUS.WATCHING]: { label: 'Watching', className: 'bg-ink-700 text-ink-200' },
  [ALERT_STATUS.TRIGGERED]: {
    label: 'Triggered',
    className: 'bg-amber/15 text-amber border border-amber/30',
  },
  [ALERT_STATUS.PAUSED]: {
    label: 'Paused',
    className: 'bg-ink-800 text-ink-400 border border-ink-600',
  },
}

export const ALERT_FILTERS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['triggered', 'Triggered'],
]

export const EMPTY_ALERTS_COPY = {
  all: ['No alerts yet', 'Create your first alert and we’ll watch the market for you.'],
  active: ['No active alerts', 'Everything has fired or is paused.'],
  triggered: [
    'Nothing has triggered yet',
    'Alerts that reach their target will show up here.',
  ],
}

/** Brand-ish hue per coin so cards are scannable at a glance. */
export const COIN_COLORS = {
  BTC: '#f7931a',
  ETH: '#8a9bff',
  XRP: '#4fd1e8',
  ADA: '#3d8bff',
  SOL: '#19e3b1',
  DOGE: '#e9c46a',
}
export const DEFAULT_COIN_COLOR = '#c6f24e'

export const PRICE_FLASH_COLORS = {
  UP: '#3ddc97',
  DOWN: '#ff6b6b',
  NEUTRAL: '#e8eef5',
}

export const DEFAULT_NOW_INTERVAL_MS = 1000
