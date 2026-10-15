import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

const STAGES = ['Contacting your bank', 'Authorising payment', 'Confirming with Bossco'] as const

/** Overlay shown while the mock gateway runs; flips to a tick on success. */
export function PaymentProcessing({ success }: { success: boolean }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (success) return
    const timer = setInterval(() => setStage((current) => Math.min(current + 1, STAGES.length - 1)), 650)
    return () => clearInterval(timer)
  }, [success])

  return (
    <div className="absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-white/92 backdrop-blur-md dark:bg-stone-900/92" role="status" aria-live="assertive">
      <div className="flex flex-col items-center px-6 text-center">
        {success ? (
          <span className="gateway-pop grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_18px_40px_-12px_rgba(16,185,129,0.7)]">
            <Check size={38} strokeWidth={3} aria-hidden />
          </span>
        ) : (
          <span className="relative grid size-20 place-items-center">
            <span className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-700" />
            <span className="gateway-processing-ring absolute inset-0 rounded-full border-4 border-transparent border-t-[#173f32] border-r-[#D9B27C] dark:border-t-amber-300" />
            <span className="font-display text-2xl font-bold text-[#173f32] dark:text-amber-200">B</span>
          </span>
        )}
        <p className="mt-6 text-lg font-bold text-[#173f32] dark:text-stone-50">{success ? 'Payment successful' : 'Processing payment'}</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{success ? 'Taking you to your order…' : `${STAGES[stage]}…`}</p>
        {!success && <p className="mt-4 text-xs text-stone-400">Please don’t close or refresh this page.</p>}
      </div>
    </div>
  )
}
