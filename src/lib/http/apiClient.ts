import { API_URL } from '../../constants/env'
import { sessionFromTokens, sessionStore, type Session } from './session'

/** Plain, serialisable error shape (safe to keep in Redux state). */
export type ApiErrorShape = {
  status: number
  message: string
  /** Machine-readable code when the API provides one, e.g. EMAIL_NOT_VERIFIED. */
  code?: string
  /** Remaining body fields (e.g. `email` on EMAIL_NOT_VERIFIED). */
  details?: Record<string, unknown>
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number
  readonly code?: string
  readonly details?: Record<string, unknown>

  constructor({ status, message, code, details }: ApiErrorShape) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  toJSON(): ApiErrorShape {
    return { status: this.status, message: this.message, code: this.code, details: this.details }
  }
}

export const toApiError = (error: unknown): ApiErrorShape => {
  if (error instanceof ApiError) return error.toJSON()
  if (error instanceof DOMException && error.name === 'AbortError') return { status: 0, message: 'Request cancelled' }
  return { status: 0, message: 'Cannot reach the server. Check your connection and try again.' }
}

export const isApiError = (error: unknown): error is ApiErrorShape =>
  typeof error === 'object' && error !== null && typeof (error as ApiErrorShape).status === 'number' && typeof (error as ApiErrorShape).message === 'string'

/** Human-readable message for any thrown / rejected value. */
export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') =>
  isApiError(error) && error.message ? error.message : fallback

type Query = Record<string, string | number | boolean | string[] | undefined | null>

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Query
  body?: unknown
  /** Send the bearer token (default true; public endpoints simply ignore it). */
  auth?: boolean
  signal?: AbortSignal
}

const buildUrl = (path: string, query?: Query) => {
  const url = new URL(`${API_URL}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item))
    else url.searchParams.set(key, String(value))
  }
  return url.toString()
}

const parseError = async (response: Response): Promise<ApiError> => {
  let body: Record<string, unknown> = {}
  try {
    body = await response.json()
  } catch {
    // Non-JSON error page; fall back to the status text.
  }
  const raw = body.message
  const message = Array.isArray(raw) ? raw.map(String).join('. ') : typeof raw === 'string' ? raw : response.statusText || 'Request failed'
  const { code } = body
  const details = Object.fromEntries(Object.entries(body).filter(([key]) => !['statusCode', 'message', 'error', 'code'].includes(key)))
  return new ApiError({
    status: response.status,
    message: response.status === 429 ? 'Too many attempts. Please wait a moment and try again.' : message,
    code: typeof code === 'string' ? code : undefined,
    details: Object.keys(details).length ? details : undefined,
  })
}

let onSessionExpired: (() => void) | null = null
/** Called once a refresh fails, so the app can drop the signed-in user. */
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler
}

let refreshing: Promise<Session | null> | null = null

async function refreshOnce(stale: Session): Promise<Session | null> {
  const run = async () => {
    // Another tab may already have rotated the token while we waited for the lock.
    const latest = sessionStore.reload()
    if (!latest) return null
    if (latest.refreshToken !== stale.refreshToken) return latest
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: latest.refreshToken }),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        sessionStore.set(null)
        onSessionExpired?.()
      }
      return null
    }
    const session = sessionFromTokens(await response.json())
    sessionStore.set(session)
    return session
  }
  // Refresh tokens rotate, so only one tab may use a given token at a time.
  const locked = navigator.locks ? navigator.locks.request('bossco.refresh', run) : run()
  return locked
}

const refreshSession = (stale: Session) => {
  refreshing ??= refreshOnce(stale).finally(() => {
    refreshing = null
  })
  return refreshing
}

async function validSession(): Promise<Session | null> {
  const session = sessionStore.get()
  if (!session) return null
  if (Date.now() < session.accessExpiresAt) return session
  return refreshSession(session)
}

async function send(path: string, options: RequestOptions, session: Session | null) {
  const isForm = options.body instanceof FormData
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  if (session) headers.Authorization = `Bearer ${session.accessToken}`
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
    signal: options.signal,
  })
}

/** Low-level request: JSON in/out, bearer auth with transparent refresh, typed errors. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const useAuth = options.auth !== false
  let session = useAuth ? await validSession() : null
  let response = await send(path, options, session)

  if (response.status === 401 && session) {
    session = await refreshSession(session)
    if (session) response = await send(path, options, session)
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const http = {
  get: <T>(path: string, query?: Query, options?: Omit<RequestOptions, 'method' | 'query'>) => request<T>(path, { ...options, query }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method'>) => request<T>(path, { ...options, method: 'DELETE' }),
}
