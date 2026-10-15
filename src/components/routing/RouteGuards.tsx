import { useEffect, type ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { loginHref, parseRoute } from '../../utils/router'
import { PageLoader } from '../ui/PageLoader'

/** Renders children for signed-in users; sends guests to the sign-in page and back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  useEffect(() => {
    // Effects can run twice (StrictMode); never wrap an already-redirected login route.
    if (isLoading || isAuthenticated || parseRoute(window.location.hash).segments[0] === 'login') return
    history.replaceState(null, '', loginHref())
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [isLoading, isAuthenticated])
  if (!isAuthenticated) return <PageLoader />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()
  return (
    <RequireAuth>
      {isAuthenticated && !isAdmin ? (
        <main className="grid min-h-[70vh] place-items-center px-6 text-center">
          <div>
            <ShieldAlert className="mx-auto text-amber-600" size={40} />
            <h1 className="mt-4 font-display text-4xl font-bold text-[#173f32] dark:text-stone-100">Admins only</h1>
            <p className="mt-2 text-sm text-stone-500">Your account does not have access to the store dashboard.</p>
            <a className="mt-6 inline-block rounded-full bg-[#173f32] px-6 py-2.5 text-sm font-bold text-white" href="#home">Back to the store</a>
          </div>
        </main>
      ) : (
        children
      )}
    </RequireAuth>
  )
}
