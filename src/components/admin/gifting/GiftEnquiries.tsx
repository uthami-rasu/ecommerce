import { Inbox, Mail, Phone, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useGetGiftEnquiriesQuery, useUpdateGiftEnquiryMutation } from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { GiftEnquiry } from '../../../types/api'
import { formatDate } from '../../../utils/format'
import { btn } from '../styles'
import { Card, CardHeader, EmptyState, ErrorState, Skeleton } from '../ui'

const FILTERS = [
  { key: 'open', label: 'Open', resolved: false },
  { key: 'resolved', label: 'Resolved', resolved: true },
  { key: 'all', label: 'All', resolved: undefined },
] as const

export function GiftEnquiries() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('open')
  const [page, setPage] = useState(1)
  const resolved = FILTERS.find((item) => item.key === filter)?.resolved
  const { data, isLoading, error, refetch } = useGetGiftEnquiriesQuery({ resolved, page, limit: 20 })

  return (
    <Card>
      <CardHeader
        icon={Inbox}
        title="Enquiries"
        description="Bulk quote and personalisation requests from the Return Gifts page."
        action={
          <div className="flex gap-1 rounded-full bg-stone-100 p-1 dark:bg-stone-800" role="tablist" aria-label="Filter enquiries">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => { setFilter(item.key); setPage(1) }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === item.key ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-white' : 'text-stone-500'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />
      {isLoading ? (
        <div className="grid gap-3 p-5">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-24" />)}</div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.data.length === 0 ? (
        <EmptyState icon={Inbox} title={filter === 'open' ? 'No open enquiries' : 'Nothing here'}>New requests from the gift page appear here.</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {data.data.map((enquiry) => <EnquiryRow key={enquiry.id} enquiry={enquiry} />)}
        </ul>
      )}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-end gap-1 border-t border-stone-100 px-5 py-3 dark:border-stone-800">
          <button type="button" className={btn.small} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <button type="button" className={btn.small} disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </Card>
  )
}

function EnquiryRow({ enquiry }: { enquiry: GiftEnquiry }) {
  const [update, { isLoading }] = useUpdateGiftEnquiryMutation()
  const setResolved = async (isResolved: boolean) => {
    try {
      await update({ id: enquiry.id, isResolved }).unwrap()
      toast.success(isResolved ? 'Marked as resolved' : 'Reopened')
    } catch (err) {
      toast.error('Not saved', { description: errorMessage(err) })
    }
  }
  const facts = [
    enquiry.occasion,
    enquiry.quantity ? `${enquiry.quantity} gifts` : null,
    enquiry.eventDate ? `Event ${formatDate(enquiry.eventDate)}` : null,
  ].filter(Boolean)

  return (
    <li className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${enquiry.kind === 'bulk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
            {enquiry.kind === 'bulk' ? 'Bulk quote' : 'Personalisation'}
          </span>
          <b className="text-sm text-stone-900 dark:text-stone-50">{enquiry.fullName}</b>
          <span className="text-xs text-stone-400">{formatDate(enquiry.createdAt)}</span>
        </div>
        {facts.length > 0 && <p className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300">{facts.join(' · ')}</p>}
        <p className="mt-2 whitespace-pre-line text-sm text-stone-600 dark:text-stone-300">{enquiry.message}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs">
          <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1 font-semibold text-[#173f32] hover:underline dark:text-emerald-400"><Mail size={12} /> {enquiry.email}</a>
          <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-[#173f32] hover:underline dark:text-emerald-400"><Phone size={12} /> {enquiry.phone}</a>
        </div>
      </div>
      <div className="self-start">
        {enquiry.isResolved ? (
          <button type="button" className={btn.small} disabled={isLoading} onClick={() => void setResolved(false)}><RotateCcw size={13} /> Reopen</button>
        ) : (
          <button type="button" className={btn.smallPrimary} disabled={isLoading} onClick={() => void setResolved(true)}><CheckCircle2 size={13} /> Mark resolved</button>
        )}
      </div>
    </li>
  )
}
