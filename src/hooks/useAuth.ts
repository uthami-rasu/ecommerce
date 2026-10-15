import { useAppSelector } from '../app/hooks'

export function useAuth() {
  const { status, user } = useAppSelector((state) => state.auth)
  return {
    user,
    status,
    /** Session restore still in flight; render a placeholder rather than "signed out". */
    isLoading: status === 'unknown',
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'admin',
  }
}
