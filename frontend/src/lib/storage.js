/** localStorage wrappers that never throw (private mode, blocked storage, SSR/tests). */
export function readStorage(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key, value) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Persistence is best-effort; the session simply won't survive a reload.
  }
}
