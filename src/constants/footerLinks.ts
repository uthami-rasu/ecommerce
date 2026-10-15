export type FooterLink = { label: string; href: string }

export const footerGroups: ReadonlyArray<{ title: string; links: readonly FooterLink[] }> = [
  {
    title: 'Shop Categories',
    links: [
      { label: 'Dry Fruits', href: '#shop/dried-fruits' },
      { label: 'Nuts', href: '#shop/nuts' },
      { label: 'Mixed Nuts', href: '#shop/mixed-nuts' },
      { label: 'Natural Honey', href: '#honey' },
      { label: 'Honeycomb', href: '#shop/honeycomb' },
      { label: 'Gift Hampers', href: '#shop/gift-sets' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '#home' },
      { label: 'Shop All', href: '#shop' },
      { label: 'Contact Us', href: '#contact' },
    ],
  },
  {
    title: 'My Account',
    links: [
      { label: 'Track Orders', href: '#account/orders' },
      { label: 'My Account', href: '#account' },
      { label: 'Wishlist', href: '#wishlist' },
      { label: 'Cart', href: '#cart' },
      { label: 'Help & Returns', href: '#contact' },
    ],
  },
]
