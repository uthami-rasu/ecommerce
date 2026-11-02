import { ExternalLink } from 'lucide-react'
import { GiftDesignEditor } from '../../components/admin/gifting/GiftDesignEditor'
import { btn } from '../../components/admin/styles'

/** `#admin/gifting` — everything shown on the storefront's gift page (#gifts). */
export function AdminGiftingPage() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">Gift Page</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Text, photos and the three gift collections on the storefront’s gift page. Customers pay through the normal checkout.</p>
        </div>
        <a href="#gifts" target="_blank" rel="noopener" className={btn.secondary}><ExternalLink size={15} /> View page</a>
      </div>
      <GiftDesignEditor />
    </div>
  )
}
