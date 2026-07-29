import honeyImage from '../../assets/images/8773eeca3cba18ea1f474f415ed58dd51b2c77ee.png'
import {
  leftHoneyBenefits,
  rightHoneyBenefits,
} from '../../constants/honeyBenefits'
import { ActionLink } from '../ui/ActionLink'
import { HoneyBenefitColumn } from './HoneyBenefitColumn'

export function HoneySection() {
  return (
    <section
      className="honey-stage relative isolate overflow-hidden bg-white px-5 py-24 dark:bg-stone-950 sm:px-8 lg:py-28"
      id="honey"
    >
      <div className="absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff5d5] blur-3xl dark:bg-amber-900/10" />
      <header className="mx-auto max-w-4xl text-center" data-reveal>
        <p className="text-xs font-semibold tracking-wide text-teal-500">
          100% Pure &amp; Raw
        </p>
        <h2 className="mt-2 font-display text-[clamp(3rem,5.5vw,5rem)] font-bold leading-none tracking-[-0.04em] text-stone-950 dark:text-stone-50">
          Pure Natural <span className="natural-mark relative inline-block px-2">Honey</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[760px] text-base leading-7 text-stone-400 dark:text-stone-500">
          Collected with care and packed with nature&apos;s goodness. Enjoy authentic taste,
          natural sweetness, and nutritional benefits in every spoonful. Sourced directly
          from trusted apiaries.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_410px_1fr] lg:gap-9">
        <div className="order-2 lg:order-none">
          <HoneyBenefitColumn features={leftHoneyBenefits} />
        </div>

        <div className="order-1 flex flex-col items-center lg:order-none" data-reveal>
          <span className="mb-2 rounded-full border border-[#dfbe71]/40 bg-[#fff8dc] px-4 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#97692e]">Single origin • raw</span>
          <img
            className="honey-float h-[390px] w-full max-w-[390px] object-contain drop-shadow-[0_30px_30px_rgba(91,57,10,.18)] sm:h-[430px]"
            src={honeyImage}
            alt="Two jars of pure natural honey on a wooden base"
            loading="lazy"
          />
          <div className="-mt-2">
            <ActionLink href="#favorites">Explore Honey Collection</ActionLink>
          </div>
        </div>

        <div className="order-3 lg:order-none">
          <HoneyBenefitColumn features={rightHoneyBenefits} />
        </div>
      </div>
    </section>
  )
}
