import { Mail, MapPin, Phone } from 'lucide-react'

export function FooterContact() {
  return (
    <address className="not-italic">
      <h2 className="text-sm font-semibold text-white">Contact Us</h2>
      <ul className="mt-7 space-y-5 text-sm text-stone-400">
        <li className="flex items-start gap-3">
          <MapPin className="mt-0.5 shrink-0 text-lime-200" size={17} fill="currentColor" />
          <span>5D/12B Pasuvanthanal Road Kovilpatti, Kovilpatti Mpty, Thoothukudi, Tamilnadu–628501</span>
        </li>
        <li>
          <a className="flex items-center gap-3 transition hover:text-white" href="tel:+918807783007">
            <Phone className="shrink-0 text-lime-200" size={17} fill="currentColor" />
            +91 8807783007
          </a>
        </li>
        <li>
          <a className="flex items-center gap-3 transition hover:text-white" href="mailto:hello@bossco.com">
            <Mail className="shrink-0 text-lime-200" size={17} fill="currentColor" />
            hello@bossco.com
          </a>
        </li>
      </ul>
    </address>
  )
}
