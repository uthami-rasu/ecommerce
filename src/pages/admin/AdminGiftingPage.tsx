import { CalendarHeart, ExternalLink, Inbox, LayoutTemplate, Package } from 'lucide-react'
import { GiftContentEditor } from '../../components/admin/gifting/GiftContentEditor'
import { GiftEnquiries } from '../../components/admin/gifting/GiftEnquiries'
import { GiftProductsManager } from '../../components/admin/gifting/GiftProductsManager'
import { OccasionsManager } from '../../components/admin/gifting/OccasionsManager'
import { btn } from '../../components/admin/styles'

const TABS = [
  { id: 'content', label: 'Page content', icon: LayoutTemplate },
  { id: 'occasions', label: 'Occasions', icon: CalendarHeart },
  { id: 'products', label: 'Gift products', icon: Package },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
] as const

/** `#admin/gifting/<tab>` — everything shown on the storefront's Return Gifts page. */
export function AdminGiftingPage({ tab: requested }: { tab?: string }) {
  const tab = TABS.find((item) => item.id === requested)?.id ?? 'content'
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">Return Gifts</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Content, occasions and products of the storefront’s Return Gifts page. Customers pay through the normal checkout.</p>
        </div>
        <a href="#gifts" target="_blank" rel="noopener" className={btn.secondary}><ExternalLink size={15} /> View page</a>
      </div>

      <nav aria-label="Return gifts sections" className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-stone-200/80 dark:bg-stone-900 dark:ring-stone-800">
        {TABS.map((item) => (
          <a
            key={item.id}
            href={`#admin/gifting/${item.id}`}
            aria-current={tab === item.id ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === item.id ? 'bg-[#173f32] text-white dark:bg-emerald-600' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            <item.icon size={15} aria-hidden /> {item.label}
          </a>
        ))}
      </nav>

      {tab === 'content' && <GiftContentEditor />}
      {tab === 'occasions' && <OccasionsManager />}
      {tab === 'products' && <GiftProductsManager />}
      {tab === 'enquiries' && <GiftEnquiries />}
    </div>
  )
}
