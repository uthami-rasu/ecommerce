import { useEffect, type ReactNode } from 'react'
import { Compass } from 'lucide-react'
import { AdminShell, type AdminSection } from '../../components/admin/AdminShell'
import { btn } from '../../components/admin/styles'
import { Card, EmptyState } from '../../components/admin/ui'
import '../../styles/admin.css'
import { AdminAddCategoryPage } from './AdminAddCategoryPage'
import { AdminEditCategoryPage } from './AdminEditCategoryPage'
import { AdminAddProductPage } from './AdminAddProductPage'
import { AdminEditProductPage } from './AdminEditProductPage'
import { AdminCategoriesPage } from './AdminCategoriesPage'
import { AdminCustomerDetailPage } from './AdminCustomerDetailPage'
import { AdminCustomersPage } from './AdminCustomersPage'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminOrderPage } from './AdminOrderPage'
import { AdminOrdersPage } from './AdminOrdersPage'
import { AdminProductsPage } from './AdminProductsPage'
import { AdminSettingsPage } from './AdminSettingsPage'

function resolve(segments: string[]): { section: AdminSection; title: string; page: ReactNode } {
  const [head, second, ...rest] = segments
  if (!head) return { section: 'dashboard', title: 'Dashboard', page: <AdminDashboardPage /> }
  if (head === 'orders' && !second) return { section: 'orders', title: 'Orders', page: <AdminOrdersPage /> }
  if (head === 'orders' && second && !rest.length) return { section: 'orders', title: 'Order', page: <AdminOrderPage key={second} id={second} /> }
  if (head === 'products' && second === 'new') return { section: 'products', title: 'Add New Product', page: <AdminAddProductPage /> }
  if (head === 'products' && second && rest[0] === 'edit') return { section: 'products', title: 'Edit Product', page: <AdminEditProductPage key={second} id={second} /> }
  if (head === 'products') return { section: 'products', title: 'Products', page: <AdminProductsPage /> }
  if (head === 'categories' && second === 'new') return { section: 'categories', title: 'Add Category', page: <AdminAddCategoryPage /> }
  if (head === 'categories' && second && rest[0] === 'edit') return { section: 'categories', title: 'Edit Category', page: <AdminEditCategoryPage key={second} id={second} /> }
  if (head === 'categories') return { section: 'categories', title: 'Categories', page: <AdminCategoriesPage /> }
  if (head === 'customers' && second && !rest.length) return { section: 'customers', title: 'Customer Details', page: <AdminCustomerDetailPage key={second} id={second} /> }
  if (head === 'customers') return { section: 'customers', title: 'Customers', page: <AdminCustomersPage /> }
  if (head === 'settings') return { section: 'settings', title: 'Settings', page: <AdminSettingsPage /> }
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
