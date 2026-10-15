import type { FooterLink } from '../../constants/footerLinks'

type FooterLinksProps = {
  title: string
  links: readonly FooterLink[]
}

export function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <nav aria-label={title}>
      <h2 className="footer-heading">{title}</h2>
      <ul className="mt-6 space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <a className="footer-link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
