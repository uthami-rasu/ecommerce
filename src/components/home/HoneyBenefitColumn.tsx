import type { Feature } from '../../types/feature'
import { HoneyBenefit } from './HoneyBenefit'

type HoneyBenefitColumnProps = {
  features: Feature[]
}

export function HoneyBenefitColumn({ features }: HoneyBenefitColumnProps) {
  return (
    <div className="flex flex-col justify-around gap-10 lg:min-h-[430px] lg:gap-20">
      {features.map((feature) => (
        <HoneyBenefit feature={feature} key={feature.title} />
      ))}
    </div>
  )
}
