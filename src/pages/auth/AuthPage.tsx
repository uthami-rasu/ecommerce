import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import type { AuthMode } from '../../components/auth/authModes'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { ForgotPasswordFlow } from '../../components/auth/ForgotPasswordFlow'
import { LoginForm } from '../../components/auth/LoginForm'
import { RegisterForm, type RegisterDraft } from '../../components/auth/RegisterForm'
import { VerifyEmailStep } from '../../components/auth/VerifyEmailStep'
import { completeSignIn } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { useRoute } from '../../hooks/useRoute'
import type { AuthResponse, OtpChallenge, UserProfile } from '../../types/api'
import { navigate, nextRoute, type Route } from '../../utils/router'
import '../../styles/auth.css'

/** A code that was just sent, kept in memory while the user moves to #verify-email. */
type Pending = { challenge: OtpChallenge; origin: 'register' | 'login' | 'verify'; notice?: string; stamp: number }

/** Login returns 403 without the challenge numbers; these mirror the API defaults (OTP_TTL / OTP_RESEND). */
const LOGIN_CHALLENGE = { expiresInSeconds: 600, resendAfterSeconds: 60 }

const destination = (route: Route, user: UserProfile) => nextRoute(route, user.role === 'admin' ? 'admin' : 'account')

export function AuthPage({ mode }: { mode: AuthMode }) {
  const route = useRoute()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAuth()
  const [pending, setPending] = useState<Pending | null>(null)
  const [draft, setDraft] = useState<RegisterDraft | undefined>(undefined)

  const next = route.query.get('next') ?? undefined
  const queryEmail = route.query.get('email')?.trim().toLowerCase() || null

  // Signed-in visitors have no business on the sign-in / sign-up forms
  // (unless they are signing in right now: `finish` navigates then).
  const signingIn = useRef(false)
  useEffect(() => {
    if (signingIn.current || !isAuthenticated || !user) return
    if (mode !== 'login' && mode !== 'register') return
    signingIn.current = true // redirect once; this page unmounts on the next route
    navigate(destination(route, user), { replace: true })
  }, [isAuthenticated, user, mode, route])

  useEffect(() => {
    const titles: Record<AuthMode, string> = {
      login: 'Sign in',
      register: 'Create account',
      'verify-email': 'Verify your email',
      'forgot-password': 'Reset password',
    }
    document.title = `${titles[mode]} · Bossco`
  }, [mode])

  const finish = useCallback(
    async (response: AuthResponse, message: string) => {
      signingIn.current = true
      await dispatch(completeSignIn(response)).unwrap()
      toast.success(message, { description: `Signed in as ${response.user.email}` })
      navigate(destination(route, response.user))
      signingIn.current = false
    },
    [dispatch, route],
  )

  const goVerify = (challenge: OtpChallenge, origin: Pending['origin'], notice?: string) => {
    setPending({ challenge, origin, notice, stamp: Date.now() })
    navigate('verify-email', { query: { email: challenge.email, next } })
  }

  const challengeFor = (email: string | null) => (pending && email && pending.challenge.email === email ? pending : null)
  const current = challengeFor(queryEmail)

  let content
  switch (mode) {
    case 'register':
      content = (
        <RegisterForm
          next={next}
          draft={draft}
          onChallenge={(challenge, values) => {
            setDraft(values)
            goVerify(challenge, 'register')
          }}
        />
      )
      break
    case 'verify-email':
      content = (
        <VerifyEmailStep
          key={`${queryEmail ?? 'none'}-${current?.stamp ?? 0}`}
          email={queryEmail}
          challenge={current?.challenge ?? null}
          notice={current?.notice}
          next={next}
          onVerified={(response) => finish(response, 'Email verified — welcome to Bossco!')}
          changeEmailLabel="Change"
          onChangeEmail={() => navigate(current?.origin === 'register' ? 'register' : 'login', { query: { next } })}
          onCodeRequested={(challenge) => goVerify(challenge, 'verify')}
        />
      )
      break
    case 'forgot-password':
      content = <ForgotPasswordFlow next={next} initialEmail={queryEmail ?? ''} onReset={(response) => finish(response, 'Password updated')} />
      break
    default:
      content = (
        <LoginForm
          key={queryEmail ?? ''}
          next={next}
          initialEmail={queryEmail ?? ''}
          onSignedIn={(response) => finish(response, `Welcome back, ${response.user.displayName || response.user.firstName}!`)}
          onUnverified={(email) =>
            goVerify(
              { email, purpose: 'verify_email', ...LOGIN_CHALLENGE },
              'login',
              'Your email isn’t verified yet. We’ve sent a 6-digit code to your inbox — enter it below to finish signing in.',
            )
          }
        />
      )
  }

  return <AuthLayout mode={mode}>{content}</AuthLayout>
}
