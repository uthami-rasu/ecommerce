import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { errorMessage } from '../../lib/http/apiClient'
import { contactRepository } from '../../repositories/contactRepository'
import leftNuts from '../../assets/images/ab48ed1fb8c87befc3434564f5ff773a6d764dac.webp'
import rightNuts from '../../assets/images/ab48ed1fb8c87befc3434564f5ff773a6d764dac (1).webp'

type Status = 'idle' | 'sending' | 'done'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const subscribe = async (event: FormEvent) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError(null)
    try {
      await contactRepository.subscribe(email.trim())
      setStatus('done')
      toast.success('You’re on the list!', { description: 'Thank you for joining the Bossco family.' })
    } catch (err) {
      const message = errorMessage(err)
      setStatus('idle')
      setError(message)
      toast.error('Could not subscribe', { description: message })
    }
  }

  return (
    <section className="bg-white px-5 py-20 dark:bg-stone-950 sm:px-8" id="newsletter">
      <div className="newsletter-card relative mx-auto flex min-h-[345px] max-w-[1180px] items-center justify-center overflow-hidden rounded-[32px] bg-[#d9aa70] px-5 py-12 text-center shadow-[0_28px_70px_rgba(102,62,21,.16)] sm:px-6 sm:py-14" data-reveal>
        <div className="absolute inset-3 rounded-[24px] border border-white/25" />
        <img
          className="pointer-events-none absolute -bottom-20 -left-12 w-[180px] select-none opacity-80 sm:-bottom-52 sm:-left-28 sm:w-[430px] sm:opacity-100"
          src={leftNuts}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <img
          className="pointer-events-none absolute -right-12 -top-20 w-[180px] rotate-180 select-none opacity-80 sm:-right-28 sm:-top-52 sm:w-[430px] sm:opacity-100"
          src={rightNuts}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />

        <div className="relative z-10 w-full max-w-[800px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/80">Join the wholesome side</p>
          <h2 className="font-display text-[clamp(2rem,7.4vw,4.2rem)] font-bold leading-[0.9] tracking-[-0.04em] text-[#173f32]">
            <span className="block">Fresh drops &amp;</span>
            <span className="block italic text-white">tasty little secrets.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85">Get first bites of new launches, seasonal bundles and members-only offers.</p>
          {status === 'done' ? (
            <p className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-[#173f32] shadow-md" role="status">
              <Check size={16} className="text-[#4f7f46]" /> Subscribed — watch your inbox for the next harvest.
            </p>
          ) : (
            <form className="mx-auto mt-7 flex max-w-[560px] flex-col gap-3 sm:flex-row" onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                className="h-12 min-w-0 w-full rounded-full border border-white/60 sm:w-auto sm:flex-1 bg-white/15 px-6 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white focus:border-white focus:ring-2 focus:ring-white/30"
                id="newsletter-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setError(null) }}
                maxLength={254}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
              />
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-[#b07a3c] shadow-md transition hover:-translate-y-0.5 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173f32] disabled:cursor-wait disabled:opacity-80"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? <><Loader2 className="animate-spin" size={15} /> Subscribing…</> : 'Subscribe'}
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-xs font-semibold text-[#5b1d14]" id="newsletter-error" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  )
}
