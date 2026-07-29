import { Camera, MessageCircle, ThumbsUp } from 'lucide-react'
import bosscoLogo from '../../assets/images/Bossco_Logo__2__page-0001-removebg-preview.png'

const socialLinks = [
  { label: 'Instagram', icon: Camera },
  { label: 'Facebook', icon: ThumbsUp },
  { label: 'WhatsApp', icon: MessageCircle },
] as const

export function FooterBrand() {
  return (
    <div>
      <a className="inline-grid size-[88px] place-items-center" href="#home" aria-label="Bossco home">
        <img
          className="size-[122px] max-w-none object-contain"
          src={bosscoLogo}
          alt="Bossco — House of Dry Fruits and Nuts"
        />
      </a>
      <p className="mt-7 max-w-[220px] text-sm leading-7 text-stone-400">
        “Celebrate Every Moment with the Richness of Dry Fruits!”
      </p>
      <div className="mt-6 flex gap-3">
        {socialLinks.map(({ label, icon: Icon }) => (
          <a
            className="grid size-10 place-items-center rounded-full bg-white/10 text-stone-300 transition hover:-translate-y-0.5 hover:bg-[#dfa66c] hover:text-white"
            href={`#${label.toLowerCase()}`}
            aria-label={label}
            key={label}
          >
            <Icon aria-hidden="true" size={17} />
          </a>
        ))}
      </div>
    </div>
  )
}
