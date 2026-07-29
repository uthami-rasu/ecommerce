import type { Feature } from '../../types/feature'

type HoneyBenefitProps = {
  feature: Feature
}

export function HoneyBenefit({ feature }: HoneyBenefitProps) {
  const Icon = feature.icon

  return (
    <article className="group flex items-start gap-5 rounded-[22px] border border-transparent p-3 text-left transition duration-500 hover:border-[#eee2c9] hover:bg-[#fffcf5] hover:shadow-[0_15px_35px_rgba(57,38,10,.06)]" data-reveal>
      <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#fbf1d6] text-[#dea868] transition duration-500 group-hover:rotate-12 group-hover:scale-110 dark:bg-stone-800 dark:text-amber-300">
        <Icon aria-hidden="true" size={27} fill="currentColor" strokeWidth={2} />
      </span>
      <div>
        <h3 className="max-w-[170px] text-[clamp(1.25rem,2vw,1.75rem)] font-semibold leading-tight text-stone-950 dark:text-stone-50">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-[175px] text-[clamp(1rem,1.5vw,1.35rem)] leading-relaxed text-slate-400 dark:text-stone-400">
          {feature.description}
        </p>
      </div>
    </article>
  )
}
