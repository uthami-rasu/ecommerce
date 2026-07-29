import { footerGroups } from '../../constants/footerLinks'
import { FooterBrand } from './FooterBrand'
import { FooterContact } from './FooterContact'
import { FooterLinks } from './FooterLinks'

export function Footer() {
  return (
    <footer className="bg-[#282828] px-5 pb-8 pt-16 sm:px-8 lg:pt-20" id="contact">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1.2fr] lg:gap-10">
          <FooterBrand />
          {footerGroups.map((group) => (
            <FooterLinks key={group.title} {...group} />
          ))}
          <FooterContact />
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bossco Dry Fruits &amp; Nuts. All Rights Reserved.</p>
          <p className="font-display text-sm italic text-lime-100">
            Healthy Choices • Premium Quality • Trusted Freshness
          </p>
        </div>
      </div>
    </footer>
  )
}
