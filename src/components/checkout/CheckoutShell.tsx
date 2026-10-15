import type { ReactNode } from 'react'
import { Footer } from '../layout/Footer'
import { NutDecorations } from '../home/NutDecorations'
import { CheckoutSteps } from './CheckoutSteps'
import '../../styles/checkout.css'

type CheckoutShellProps = {
  title: string
  step?: 1 | 2 | 3
  /** Narrower content column (e.g. order complete). */
  width?: 'wide' | 'medium' | 'narrow'
  decorations?: boolean
  children: ReactNode
}

const WIDTH = { wide: 'max-w-[1180px]', medium: 'max-w-[1080px]', narrow: 'max-w-[760px]' } as const

/** Shared frame for cart → checkout → payment → complete: backdrop, display heading, steps and footer. */
export function CheckoutShell({ title, step, width = 'wide', decorations = true, children }: CheckoutShellProps) {
  return (
    <>
      <main className="checkout-page min-h-[75vh] text-stone-800 dark:text-stone-100">
        {decorations && <div className="hidden opacity-90 sm:block dark:opacity-30"><NutDecorations /></div>}
        <div className={`relative z-10 mx-auto w-full px-4 pb-24 pt-10 sm:px-6 sm:pt-14 ${WIDTH[width]}`}>
          <h1 className="text-center font-display text-[2.6rem] font-bold leading-none text-[#173f32] sm:text-[3.4rem] dark:text-stone-50">
            {title}
          </h1>
          {step ? <CheckoutSteps active={step} /> : <div className="h-8 sm:h-12" />}
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
