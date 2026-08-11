import { toast } from 'sonner'
import { Camera, Edit3, X } from 'lucide-react'
import { useState } from 'react'
import { NutDecorations } from '../components/home/NutDecorations'
import type { HoneyProduct } from '../types/catalog'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addToCart, toggleWishlist } from '../features/commerce/commerceSlice'

type MyAccountProps = {
  products: HoneyProduct[]
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function MyAccountPage({ products }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'address' | 'orders' | 'wishlist'>('account')
  const dispatch = useAppDispatch()
  const { wishlist } = useAppSelector((state) => state.commerce)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  })

  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    toast.success('Account details updated!', { description: 'Your profile and settings have been saved.' })
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Fallback mock orders matching screenshot
  const displayOrders = [
    { id: '1', date: 'October 17, 2023', total: 1234.00, itemsCount: 2, status: 'Delivered', product: products[0] || { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&q=80', size: '250 gm' } },
    { id: '2', date: 'October 17, 2023', total: 1234.00, itemsCount: 1, status: 'Delivered', product: products[1] || { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&q=80', size: '250 gm' } },
    { id: '3', date: 'October 17, 2023', total: 1234.00, itemsCount: 3, status: 'Delivered', product: products[2] || { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&q=80', size: '250 gm' } },
    { id: '4', date: 'October 17, 2023', total: 1234.00, itemsCount: 1, status: 'Delivered', product: products[0] || { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&q=80', size: '250 gm' } },
  ]

  const wishedProducts = wishlist
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is HoneyProduct => Boolean(product))

  // Fallback wished products if empty to match screenshot demonstration
  const displayWishlist = wishedProducts.length > 0 ? wishedProducts : products.slice(0, 4)

  return (
    <main className="commerce-page account-page relative overflow-hidden">
      <NutDecorations />
      <div className="commerce-wrap relative z-10">
        <h1 className="text-center font-display text-4xl md:text-5xl font-bold text-[#173f32] mb-12">My Account</h1>

        <div className="account-layout grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          {/* Sidebar */}
          <aside className="account-sidebar bg-[#FBF8F5] border border-[#efeae1] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Sofia Havertz"
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-[#252525] text-white p-1.5 rounded-full shadow-md hover:bg-stone-800 transition-colors"
                aria-label="Change profile photo"
              >
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-6">Sofia Havertz</h2>

            <nav className="w-full flex flex-col gap-1 text-left">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`account-nav-item ${activeTab === 'account' ? 'is-active' : ''}`}
              >
                <span>Account</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('address')}
                className={`account-nav-item ${activeTab === 'address' ? 'is-active' : ''}`}
              >
                <span>Address</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`account-nav-item ${activeTab === 'orders' ? 'is-active' : ''}`}
              >
                <span>Orders</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`account-nav-item ${activeTab === 'wishlist' ? 'is-active' : ''}`}
              >
                <span>Wishlist</span>
              </button>
              <a
                href="#home"
                className="account-nav-item text-stone-600 hover:text-red-600 mt-2 border-t border-stone-200/60 pt-3"
              >
                <span>Log Out</span>
              </a>
            </nav>
          </aside>

          {/* Main Content Area */}
          <section className="account-content min-w-0">
            {/* Account Details Tab */}
            {activeTab === 'account' && (
              <form onSubmit={handleSave} className="space-y-8 bg-white/80 backdrop-blur-sm border border-[#e2ded5] rounded-xl p-6 md:p-8 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-[#173f32] mb-6">Account Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">FIRST NAME *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="account-input"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">LAST NAME *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="account-input"
                        placeholder="Last name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">DISPLAY NAME *</label>
                      <input
                        type="text"
                        required
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="account-input"
                        placeholder="Display name"
                      />
                      <p className="text-xs text-stone-500 italic mt-1.5">
                        This will be how your name will be displayed in the account section and in reviews
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">EMAIL *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="account-input"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200">
                  <h2 className="text-2xl font-bold text-[#173f32] mb-6">Password</h2>
                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">OLD PASSWORD</label>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        className="account-input"
                        placeholder="Old password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">NEW PASSWORD</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="account-input"
                        placeholder="New password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">REPEAT NEW PASSWORD</label>
                      <input
                        type="password"
                        value={formData.repeatPassword}
                        onChange={(e) => setFormData({ ...formData, repeatPassword: e.target.value })}
                        className="account-input"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="bg-[#D9B27C] hover:bg-[#c9a068] text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-md text-sm"
                  >
                    Save changes
                  </button>
                  {saveSuccess && <span className="text-emerald-700 text-sm font-semibold">Changes saved successfully!</span>}
                </div>
              </form>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="bg-white/80 backdrop-blur-sm border border-[#e2ded5] rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#173f32]">Address</h2>
                  <button type="button" className="text-[#D9B27C] hover:underline font-bold text-sm flex items-center gap-1">
                    Add address +
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billing Address Card */}
                  <div className="border-2 border-[#E6C594] rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[#D9B27C] font-bold mb-3">
                        <span>Billing Address</span>
                        <button type="button" className="flex items-center gap-1 text-xs hover:underline">
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-stone-800 text-sm space-y-1">
                        <p className="font-semibold text-stone-900">Sofia Havertz</p>
                        <p className="text-stone-600">(+1) 234 567 890</p>
                        <p className="text-stone-600">345 Long Island, NewYork, United States</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Card */}
                  <div className="border-2 border-[#E6C594] rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[#D9B27C] font-bold mb-3">
                        <span>Shipping Address</span>
                        <button type="button" className="flex items-center gap-1 text-xs hover:underline">
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                      <div className="text-stone-800 text-sm space-y-1">
                        <p className="font-semibold text-stone-900">Sofia Havertz</p>
                        <p className="text-stone-600">(+1) 234 567 890</p>
                        <p className="text-stone-600">345 Long Island, NewYork, United States</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders History Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white/80 backdrop-blur-sm border border-[#e2ded5] rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-8">Orders History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-200 text-xs font-semibold">
                        <th className="pb-3 font-normal">Product</th>
                        <th className="pb-3 font-normal">Dates</th>
                        <th className="pb-3 font-normal">Status</th>
                        <th className="pb-3 font-normal text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {displayOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={'image' in order.product ? order.product.image : products[0]?.image}
                                alt={order.product.name}
                                className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                              />
                              <div>
                                <p className="font-bold text-stone-900 text-sm">{order.product.name}</p>
                                <p className="text-xs text-stone-400">
                                  (Weight: {'size' in order.product ? order.product.size : '250 gm'})
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-stone-700 font-medium text-xs">
                            {order.date}
                          </td>
                          <td className="py-4 text-stone-700 font-medium text-xs">
                            {order.status}
                          </td>
                          <td className="py-4 text-right font-bold text-stone-900 text-sm">
                            {money(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Your Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white/80 backdrop-blur-sm border border-[#e2ded5] rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-8">Your Wishlist</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-200 text-xs font-semibold">
                        <th className="pb-3 font-normal w-12"></th>
                        <th className="pb-3 font-normal">Product</th>
                        <th className="pb-3 font-normal">Price</th>
                        <th className="pb-3 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {displayWishlist.map((product) => (
                        <tr key={product.id} className="hover:bg-stone-50/50">
                          <td className="py-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(toggleWishlist(product.id))
                                toast.info('Removed from wishlist')
                              }}
                              className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                              aria-label={`Remove ${product.name} from wishlist`}
                            >
                              <X size={16} />
                            </button>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                              />
                              <div>
                                <p className="font-bold text-stone-900 text-sm">{product.name}</p>
                                <p className="text-xs text-stone-400">(Weight: {product.size})</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-stone-900 text-sm">
                            {money(product.price)}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(addToCart({ productId: product.id, quantity: 1, weight: product.size }))
                                toast.success('Added to cart!', { description: `${product.name} added to your bag.` })
                              }}
                              className="bg-[#D9B27C] hover:bg-[#c9a068] text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                            >
                              Add to cart
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <div className="commerce-bottom-bar" />
    </main>
  )
}
