import { ArrowLeft, Copy, History, PackageSearch, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { ActionPanel } from '../../components/admin/ActionPanel'
import { OrderTimeline, PostUpdateForm } from '../../components/admin/OrderActivity'
import { CustomerCard, CustomerNote, ItemsCard, PaymentCard } from '../../components/admin/OrderInfoCards'
import { OrderStepper } from '../../components/admin/OrderStepper'
import { OrderStatusBadge, PaymentBadge } from '../../components/admin/StatusBadge'
import { btn } from '../../components/admin/styles'
import { TrackingCard } from '../../components/admin/TrackingCard'
import { Card, CardHeader, EmptyState, ErrorState, Skeleton } from '../../components/admin/ui'
import { useGetAdminOrderQuery } from '../../features/admin/adminApi'
import { isApiError } from '../../lib/http/apiClient'
import type { AdminOrderDetail } from '../../types/api'
import { formatDateTime, formatRelative, fullName } from '../../utils/format'

function BackLink() {
  return (
    <a href="#admin/orders" className="inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-medium text-stone-500 transition-colors hover:text-[#173f32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-stone-400 dark:hover:text-white">
      <ArrowLeft size={15} aria-hidden /> Orders
    </a>
  )
}

function OrderHeader({ order, fetching, onRefresh }: { order: AdminOrderDetail; fetching: boolean; onRefresh: () => void }) {
  const name = order.customer ? fullName(order.customer) : fullName(order.shippingAddress)
  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber)
      toast.success('Order number copied')
    } catch {
      toast.error('Couldn’t copy the order number')
    }
  }
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <BackLink />
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-[2.1rem] font-bold leading-none text-[#173f32] sm:text-5xl dark:text-stone-50">{order.orderNumber}</h1>
          <button type="button" className={`${btn.icon} !size-8`} onClick={copyNumber} aria-label="Copy order number">
            <Copy size={14} aria-hidden />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Placed <time dateTime={order.createdAt} className="font-medium text-stone-700 dark:text-stone-300">{formatDateTime(order.createdAt)}</time> ({formatRelative(order.createdAt)})
          {' '}by <span className="font-medium text-stone-700 dark:text-stone-300">{name || order.contactEmail}</span>
        </p>
      </div>
      <button type="button" className={btn.secondary} onClick={onRefresh} disabled={fetching}>
        <RotateCw size={15} aria-hidden className={fetching ? 'animate-spin' : ''} /> Refresh
      </button>
    </header>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading order">
      <div><Skeleton className="h-4 w-20" /><Skeleton className="mt-3 h-11 w-64" /><Skeleton className="mt-3 h-4 w-80 max-w-full" /></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid content-start gap-6"><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-64 w-full rounded-2xl" /></div>
        <div className="grid content-start gap-6"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-56 w-full rounded-2xl" /></div>
      </div>
    </div>
  )
}

export function AdminOrderPage({ id }: { id: string }) {
  const { data: order, error, isLoading, isFetching, refetch } = useGetAdminOrderQuery(id, { refetchOnMountOrArgChange: true })

  if (isLoading) return <DetailSkeleton />
  if (!order) {
    const notFound = isApiError(error) && (error.status === 404 || error.status === 400)
    return (
      <div>
        <BackLink />
        <Card className="mt-4">
          {notFound ? (
            <EmptyState icon={PackageSearch} title="Order not found" action={<a href="#admin/orders" className={btn.primary}>Back to orders</a>}>
              It may have been removed, or the link is wrong.
            </EmptyState>
          ) : (
            <ErrorState error={error} onRetry={refetch} title="Couldn’t load this order" />
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:gap-6">
      <OrderHeader order={order} fetching={isFetching} onRefresh={refetch} />

      <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* One action panel: first on mobile, top of the side column on desktop. */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1"><ActionPanel order={order} /></div>

        <div className="grid min-w-0 gap-5 sm:gap-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <Card aria-labelledby={`progress-${order.id}`}>
            <CardHeader id={`progress-${order.id}`} title="Progress" description={order.status === 'delivered' ? 'Delivered: all steps complete' : order.status === 'cancelled' ? 'Stopped: the order was cancelled' : 'Packing and out-for-delivery are optional steps'} />
            <OrderStepper order={order} />
          </Card>
          {order.notes && <CustomerNote note={order.notes} />}
          <TrackingCard order={order} />
          <ItemsCard order={order} />
          <Card aria-labelledby={`activity-${order.id}`}>
            <CardHeader id={`activity-${order.id}`} title="Activity" description="Everything on this timeline is also shown to the customer" icon={History} />
            <div className="grid gap-6 px-5 py-5">
              {order.status !== 'cancelled' && <PostUpdateForm order={order} />}
              <OrderTimeline events={order.timeline ?? []} />
            </div>
          </Card>
        </div>

        <aside className="grid min-w-0 content-start gap-5 sm:gap-6 lg:col-start-2 lg:row-start-2" aria-label="Order summary">
          <CustomerCard order={order} />
          <PaymentCard order={order} />
        </aside>
      </div>
    </div>
  )
}
