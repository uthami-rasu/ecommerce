import { Leaf, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import honeyJars from '../../assets/images/8773eeca3cba18ea1f474f415ed58dd51b2c77ee.webp'
import nutsCluster from '../../assets/images/ab48ed1fb8c87befc3434564f5ff773a6d764dac.webp'
import botanical from '../../assets/images/nature-botanical-3d.webp'
import { Brand } from '../ui/Brand'
import type { AuthMode } from './authModes'

const COPY: Record<AuthMode, { eyebrow: string; title: [string, string]; body: string }> = {
  login: {
    eyebrow: 'Welcome back',
    title: ['Nature’s finest,', 'saved for you.'],
    body: 'Sign in to pick up your cart, track every order and keep your favourites close.',
  },
  register: {
    eyebrow: 'Join the house',
    title: ['Good things grow', 'from good roots.'],
    body: 'Create your Bossco account for faster checkout, order tracking and a wishlist that follows you.',
  },
  'verify-email': {
    eyebrow: 'Almost there',
    title: ['One small step,', 'then pure goodness.'],
    body: 'Confirm your email so we can keep your account and orders safe.',
  },
  'forgot-password': {
    eyebrow: 'Account recovery',
    title: ['Let’s get you', 'back inside.'],
    body: 'We’ll email you a one-time code to set a fresh password in under a minute.',
  },
}

const TRUST = [
  { icon: Leaf, label: '100% natural, small-batch sourced' },
  { icon: Truck, label: 'Fast, careful delivery across India' },
  { icon: ShieldCheck, label: 'Secure accounts & encrypted checkout' },
]

/** Left half of the auth screen (desktop): animated green aurora, product imagery, tagline and trust points. */
export function BrandPanel({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode]
  return (
    <aside className="auth-aurora auth-grain auth-brand-light relative hidden overflow-hidden text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[46%] xl:w-[48%] lg:flex-col">
      <img src={botanical} alt="" aria-hidden="true" className="pointer-events-none absolute -right-24 -top-10 w-[30rem] rotate-[200deg] opacity-25 mix-blend-luminosity" />
      <span className="pointer-events-none absolute left-1/2 top-[58%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9B27C]/25 blur-[90px]" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col px-10 py-8 xl:px-14">
        <Brand />

        <div className="mt-10 max-w-md">
          <p key={`eyebrow-${mode}`} className="auth-swap inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100 backdrop-blur">
            <Sparkles size={12} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 key={`title-${mode}`} className="auth-swap mt-5 font-display text-[3.4rem] font-bold leading-[0.95] tracking-tight xl:text-[4rem]">
            {copy.title[0]}
            <br />
            <span className="bg-gradient-to-r from-[#f3d9a8] via-[#D9B27C] to-[#f7e4bf] bg-clip-text italic text-transparent">{copy.title[1]}</span>
          </h2>
          <p key={`body-${mode}`} className="auth-swap mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">{copy.body}</p>
        </div>

        <div className="relative mt-4 min-h-[180px] flex-1" aria-hidden="true">
          <img src={nutsCluster} alt="" className="auth-float-slow absolute -left-[4%] bottom-0 h-full max-h-[440px] w-auto opacity-90 drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]" />
          <img src={honeyJars} alt="" className="auth-float absolute inset-0 z-10 m-auto h-[92%] max-h-[420px] w-auto drop-shadow-[0_40px_50px_rgba(0,0,0,0.45)]" />
          <div className="auth-float-slow absolute right-[4%] top-[12%] z-20 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100/90">Raw forest honey</p>
            <p className="mt-0.5 font-display text-xl font-bold leading-none">Lab-tested purity</p>
          </div>
        </div>

        <ul className="relative z-10 mt-6 grid gap-2.5 border-t border-white/10 pt-6 xl:grid-cols-3 xl:gap-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-[13px] leading-snug text-white/80">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-amber-200 ring-1 ring-white/15">
                <Icon size={15} aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
