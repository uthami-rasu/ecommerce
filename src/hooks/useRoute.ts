import { useEffect, useState } from 'react'
import { parseRoute, type Route } from '../utils/router'

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const update = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', update)
    // Child effects (e.g. a guard redirect) run before this one on first mount; catch up.
    update()
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}
