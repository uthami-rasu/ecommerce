/**
 * Persisted auth session (access + refresh token). Lives outside Redux so the
 * HTTP client stays independent of the UI layer; Redux only mirrors the user.
 */

export type Session = {
  accessToken: string
  refreshToken: string
  /** Epoch ms after which the access token should be considered stale. */
  accessExpiresAt: number
}

export const SESSION_STORAGE_KEY = 'bossco.session'

type Listener = (session: Session | null) => void
const listeners = new Set<Listener>()

let current: Session | null = read()

function read(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    return parsed.refreshToken ? parsed : null
  } catch {
    return null
  }
}

function write(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Storage can be unavailable (private mode); the in-memory session still works.
  }
}

export const sessionStore = {
  get: () => current,
  /** Re-reads storage, picking up a token another tab refreshed. */
  reload: () => (current = read()),
  set(session: Session | null) {
    current = session
    write(session)
  },
  /** Fires when ANOTHER tab signs in, refreshes or signs out. */
  subscribeExternal(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export const sessionFromTokens = (tokens: { accessToken: string; refreshToken: string; expiresIn: number }): Session => ({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  // Refresh 30 s early so requests never race the expiry.
  accessExpiresAt: Date.now() + Math.max(0, tokens.expiresIn - 30) * 1000,
})

// Keep tabs in sync: signing in or out in one tab applies to all.
window.addEventListener('storage', (event) => {
  if (event.key !== SESSION_STORAGE_KEY) return
  current = read()
  listeners.forEach((listener) => listener(current))
})
