type FooterLinksProps = {
  title: string
  links: readonly string[]
}

export function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-7 space-y-4">
        {links.map((link) => (
          <li key={link}>
            <a
              className="text-sm text-stone-400 transition hover:text-[#e5b97f]"
              href={link === 'Home' ? '#home' : '#favorites'}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
