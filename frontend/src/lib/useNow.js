import { useEffect, useState } from 'react'
import { DEFAULT_NOW_INTERVAL_MS } from './constants'

const isValidInterval = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0


export function useNow(intervalMs = DEFAULT_NOW_INTERVAL_MS) {
  const safeInterval = isValidInterval(intervalMs) ? intervalMs : DEFAULT_NOW_INTERVAL_MS
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), safeInterval)
    return () => clearInterval(id)
  }, [safeInterval])
  return now
}
