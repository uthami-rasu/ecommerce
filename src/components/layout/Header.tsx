import {
  ChevronDown,
  Heart,
  Home,
  Images,
  Layers,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Brand } from '../ui/Brand'
import { SearchPanel } from './SearchPanel'
import { AccountMenu } from './AccountMenu'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useGetCategoriesQuery } from '../../features/catalog/catalogApi'

export function Header() {
  const { count: cartCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClickOutside)
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
          <a className="nav-icon-link group" href="#home">
            <Home size={15} strokeWidth={1.8} /><span>Home</span>
          </a>

          {/* Dynamic Categories Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setIsCategoriesOpen(true)}
            onMouseLeave={() => setIsCategoriesOpen(false)}
          >
            <button
              type="button"
              className={`nav-icon-link group cursor-pointer ${isCategoriesOpen ? 'is-active text-[#173f32]' : ''}`}
              onClick={() => setIsCategoriesOpen((prev) => !prev)}
              aria-expanded={isCategoriesOpen}
              aria-haspopup="true"
            >
              <ShoppingBag size={15} strokeWidth={1.8} />
              <span>Categories</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 text-stone-500 group-hover:text-[#173f32] ${isCategoriesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isCategoriesOpen && (
              <div
                className="absolute left-0 top-full pt-2 z-[70] w-72 animate-in fade-in slide-in-from-top-2 duration-150"
                role="menu"
              >
                <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-[0_24px_50px_rgba(20,53,41,.18)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/95">
                  <div className="border-b border-stone-100 pb-2 mb-2 dark:border-stone-800">
                    <a
                      href="#shop"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#173f32] hover:bg-emerald-50/80 transition-colors dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    >
                      <span className="flex items-center gap-2">
                        <Layers size={14} /> All Collections
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">View All</span>
                    </a>
                  </div>

                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category.id} className="group/cat">
                        <a
                          href={`#shop/${category.slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-amber-50/80 hover:text-[#173f32] dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                          <span className="font-bold">{category.name}</span>
                          {category.productCount > 0 && (
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                              {category.productCount}
                            </span>
                          )}
                        </a>
                        {category.children && category.children.length > 0 && (
                          <div className="pl-4 pr-1 py-0.5 space-y-0.5">
                            {category.children.map((sub) => (
                              <a
                                key={sub.id}
                                href={`#shop/${sub.slug}`}
                                onClick={() => setIsCategoriesOpen(false)}
                                className="block rounded-lg px-2.5 py-1 text-[11px] text-stone-500 hover:text-[#173f32] hover:bg-stone-50 transition-colors dark:text-stone-400 dark:hover:bg-stone-800/60"
                              >
                                {sub.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a className="nav-icon-link group" href="#trending">
            <Sparkles size={15} strokeWidth={1.8} /><span>Gifting</span>
          </a>
          <a className="nav-icon-link group" href="#gallery">
            <Images size={15} strokeWidth={1.8} /><span>Gallery</span>
          </a>
          <a className="nav-icon-link group" href="#contact">
            <MessageCircle size={15} strokeWidth={1.8} /><span>Contact</span>
          </a>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button className="icon-button mobile-only" aria-label="Search" type="button" onClick={() => setIsSearchOpen(true)}><Search size={18} /></button>
          <div className="hidden items-center sm:flex">
            <button className="icon-button group relative" aria-label="Search" type="button" onClick={() => setIsSearchOpen(true)}>
              <Search className="transition group-hover:rotate-[-8deg] group-hover:scale-110" size={18} />
              <span className="absolute -bottom-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#173f32] px-2 py-1 text-[9px] text-white group-hover:block">Search ⌘K</span>
            </button>
            <a className="icon-button group relative" aria-label="Wishlist" href="#wishlist">
              <Heart className="transition group-hover:-translate-y-0.5 group-hover:scale-110" size={18} />
              {wishlistCount > 0 && <span className="header-count">{wishlistCount}</span>}
            </a>
          </div>
          <AccountMenu />
          <a className="icon-button relative" aria-label="Shopping cart" href="#cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="header-count">{cartCount}</span>}
          </a>
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
      {isMenuOpen && (
        <nav className="border-t border-stone-100 bg-white px-5 py-4 shadow-lg dark:border-stone-800 dark:bg-stone-950 md:hidden" aria-label="Mobile navigation">
          <a
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
            href="#home"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home size={17} /> Home
          </a>

          {/* Collapsible Mobile Categories */}
          <div>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
              onClick={() => setMobileCategoriesOpen((prev) => !prev)}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={17} /> Categories
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform text-stone-400 ${mobileCategoriesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileCategoriesOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 bg-stone-50/70 rounded-xl my-1 dark:bg-stone-900/60">
                <a
                  href="#shop"
                  className="block py-2 text-xs font-bold text-[#173f32] dark:text-emerald-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Collections
                </a>
                {categories.map((c) => (
                  <div key={c.id}>
                    <a
                      href={`#shop/${c.slug}`}
                      className="block py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {c.name}
                    </a>
                    {c.children?.map((sub) => (
                      <a
                        key={sub.id}
                        href={`#shop/${sub.slug}`}
                        className="block pl-3 py-1 text-[11px] text-stone-500 dark:text-stone-400"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        • {sub.name}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
            href="#trending"
            onClick={() => setIsMenuOpen(false)}
          >
            <Sparkles size={17} /> Gifting
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
            href="#gallery"
            onClick={() => setIsMenuOpen(false)}
          >
            <Images size={17} /> Gallery
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-900"
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
          >
            <MessageCircle size={17} /> Contact
          </a>
        </nav>
      )}
      {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}
    </header>
  )
}

