import { useEffect, useRef } from 'react'
import { API_URL } from '../constants/env'

const PING_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

/**
 * Keeps the Render backend awake while the user is browsing the storefront.
 * Render free tier instances spin down after 15 minutes of inactivity;
 * sending a lightweight health ping every 2 minutes prevents mid-session cold starts.
 */
export function useKeepAlive() {
  const isPinging = useRef(false)

  useEffect(() => {
    // Skip if running against local mock/dev without internet
    if (!API_URL || API_URL.includes('localhost')) return

    const ping = async () => {
      if (isPinging.current) return
      isPinging.current = true
      try {
        await fetch(`${API_URL}/health`, {
          method: 'GET',
          cache: 'no-store',
          keepalive: true,
        })
      } catch {
        // Silently catch network failures — keep-alive is non-critical background traffic
      } finally {
        isPinging.current = false
      }
    }

    // Ping immediately on page mount
    void ping()

    // Ping every 2 minutes while page is open
    const interval = setInterval(ping, PING_INTERVAL_MS)

    // Also ping when visitor switches back to this browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void ping()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
