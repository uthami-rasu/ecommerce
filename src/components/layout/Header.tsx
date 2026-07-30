import {
  Heart,
  Home,
  Images,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'
import { Brand } from '../ui/Brand'
import { SearchPanel } from './SearchPanel'

const headerActions = [
  { label: 'Wishlist', icon: Heart },
  { label: 'Account', icon: UserRound },
] as const

const categoryLinks = [
  { label: 'Daily nuts', detail: 'Almonds, cashews & pistachios', icon: '🥜' },
  { label: 'Dried fruits', detail: 'Figs, berries, dates & kiwi', icon: '🍓' },
  { label: 'Smart mixes', detail: 'Protein & energy trail mixes', icon: '⚡' },
  { label: 'Gift hampers', detail: 'Made for every celebration', icon: '🎁' },
]

const navItems = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Shop', href: '#favorites', icon: ShoppingBag, opensMenu: true },
  { label: 'Gifting', href: '#trending', icon: Sparkles },
  { label: 'Gallery', href: '#gallery', icon: Images },
  { label: 'Contact', href: '#contact', icon: MessageCircle },
] as const

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsCategoriesOpen(false)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-[#e8e2d8]/80 bg-[#fffdf8]/90 backdrop-blur-xl transition-shadow duration-300 dark:border-stone-800 dark:bg-stone-950/90 ${isScrolled ? 'shadow-[0_10px_35px_rgba(24,50,39,.1)]' : ''}`}>
      <div className={`hidden items-center justify-center overflow-hidden bg-[#173f32] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f6e9cd] transition-all sm:flex ${isScrolled ? 'h-0' : 'h-8'}`}>
        Free delivery above ₹999 <span className="mx-3 text-[#d8b36a]">•</span> Freshly packed after you order
      </div>
      <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map(({ label, href, icon: Icon, ...item }) => 'opensMenu' in item && item.opensMenu ? (
            <button className={`nav-icon-link group ${isCategoriesOpen ? 'is-active' : ''}`} key={label} type="button" onClick={() => setIsCategoriesOpen((open) => !open)} aria-expanded={isCategoriesOpen}>
              <Icon size={15} strokeWidth={1.8} /><span>{label}</span><span className={`text-[8px] transition ${isCategoriesOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
          ) : (
            <a className="nav-icon-link group" href={href} key={label}>
              <Icon size={15} strokeWidth={1.8} /><span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button className="icon-button mobile-only" aria-label="Search" type="button" onClick={() => setIsSearchOpen(true)}><Search size={18} /></button>
          <div className="hidden items-center sm:flex">
            <button className="icon-button group relative" aria-label="Search" type="button" onClick={() => setIsSearchOpen(true)}>
              <Search className="transition group-hover:rotate-[-8deg] group-hover:scale-110" size={18} />
              <span className="absolute -bottom-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#173f32] px-2 py-1 text-[9px] text-white group-hover:block">Search ⌘K</span>
            </button>
            {headerActions.map(({ label, icon: Icon }) => (
              <button className="icon-button group" aria-label={label} key={label} type="button">
                <Icon className="transition group-hover:-translate-y-0.5 group-hover:scale-110" size={18} />
              </button>
            ))}
          </div>
          <button className="icon-button relative" aria-label="Shopping cart" type="button">
            <ShoppingBag size={18} />
            <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#5c8c50] text-[9px] font-bold text-white">
              2
            </span>
          </button>
          <button
            className="icon-button mobile-only"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {isCategoriesOpen && (
        <div className="mega-menu absolute inset-x-0 top-full border-t border-[#e9e1d5] bg-[#fffdf8]/98 px-6 py-6 shadow-[0_24px_60px_rgba(25,48,39,.14)] backdrop-blur-xl dark:bg-stone-950">
          <div className="mx-auto grid max-w-[1050px] grid-cols-2 gap-3 lg:grid-cols-4">
            {categoryLinks.map((category, index) => (
              <a className="group flex items-center gap-4 rounded-2xl border border-transparent p-4 transition hover:border-[#dfd0b7] hover:bg-[#f6f0e5]" href="#favorites" key={category.label} onClick={() => setIsCategoriesOpen(false)} style={{ animationDelay: `${index * 60}ms` }}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-sm transition duration-300 group-hover:-rotate-6 group-hover:scale-110">{category.icon}</span>
                <span><strong className="block text-sm text-[#193f32] dark:text-white">{category.label}</strong><small className="mt-1 block text-[10px] text-stone-500">{category.detail}</small></span>
              </a>
            ))}
          </div>
        </div>
      )}
      {isMenuOpen && (
        <nav className="border-t border-stone-100 bg-white px-5 py-4 shadow-lg dark:border-stone-800 dark:bg-stone-950 md:hidden" aria-label="Mobile navigation">
          {navItems.map(({ label, href, icon: Icon }) => (
            <a
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
              href={href}
              key={label}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon size={17} /> {label}
            </a>
          ))}
        </nav>
      )}
      {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}
    </header>
  )
}
