import { useEffect, type ReactNode } from 'react'
import { Compass } from 'lucide-react'
import { AdminShell, type AdminSection } from '../../components/admin/AdminShell'
import { btn } from '../../components/admin/styles'
import { Card, EmptyState } from '../../components/admin/ui'
import '../../styles/admin.css'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminOrderPage } from './AdminOrderPage'
import { AdminOrdersPage } from './AdminOrdersPage'

function resolve(segments: string[]): { section: AdminSection; title: string; page: ReactNode } {
  const [head, id, ...rest] = segments
  if (!head) return { section: 'dashboard', title: 'Dashboard', page: <AdminDashboardPage /> }
  if (head === 'orders' && !id) return { section: 'orders', title: 'Orders', page: <AdminOrdersPage /> }
  if (head === 'orders' && id && !rest.length) return { section: 'orders', title: 'Order', page: <AdminOrderPage key={id} id={id} /> }
  return {
    section: 'dashboard',
    title: 'Not found',
    page: (
      <Card>
        <EmptyState icon={Compass} title="Page not found" action={<a href="#admin" className={btn.primary}>Go to the dashboard</a>}>
          This admin page doesn’t exist.
        </EmptyState>
      </Card>
    ),
  }
}

/** Store admin: `#admin` dashboard, `#admin/orders` list, `#admin/orders/<id>` detail. */
export function AdminApp({ segments }: { segments: string[] }) {
  const { section, title, page } = resolve(segments)

  useEffect(() => {
    const previous = document.title
    document.title = `${title} · Bossco Admin`
    return () => {
      document.title = previous
    }
  }, [title])

  return <AdminShell active={section}>{page}</AdminShell>
}
