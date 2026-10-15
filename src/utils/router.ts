/**
 * Hash routing helpers. A route looks like `#orders/BSC-1234?tab=x`;
 * `path` is "orders/BSC-1234", `segments` ["orders", "BSC-1234"].
 */
export type Route = { path: string; segments: string[]; query: URLSearchParams; hash: string }

export const parseRoute = (hash: string): Route => {
  const raw = hash.replace(/^#\/?/, '')
  const [pathPart, queryPart = ''] = raw.split('?')
  const segments = pathPart.split('/').filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  })
  return { path: segments.join('/'), segments, query: new URLSearchParams(queryPart), hash }
}

/** Builds `#a/b?x=y` from a path and optional query. */
export const href = (path: string, query?: Record<string, string | undefined>) => {
  const clean = path.replace(/^#\/?/, '')
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => value !== undefined && value !== '' && params.set(key, value))
  const search = params.toString()
  return `#${clean}${search ? `?${search}` : ''}`
}

export const navigate = (path: string, options: { replace?: boolean; query?: Record<string, string | undefined> } = {}) => {
  const target = href(path, options.query)
  if (options.replace) {
    history.replaceState(null, '', target)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = target
  }
}

/** Where to send the user after signing in: the `next` param if it is an in-app hash route. */
export const nextRoute = (route: Route, fallback = 'account') => {
  const next = route.query.get('next')
  return next && /^[a-z0-9/_-]*$/i.test(next.replace(/^#/, '').split('?')[0]) ? next.replace(/^#/, '') : fallback
}

/** `#login?next=<current route>` — use when a guest hits something that needs an account. */
export const loginHref = (next = window.location.hash) => href('login', { next: next.replace(/^#/, '') || undefined })
