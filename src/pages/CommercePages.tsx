import { toast } from 'sonner'
import { Check, Heart, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addToCart, placeOrder, removeFromCart, setCartQuantity, toggleWishlist } from '../features/commerce/commerceSlice'
import type { CartLine } from '../features/commerce/commerceSlice'
import type { HoneyProduct } from '../types/catalog'
import { NutDecorations } from '../components/home/NutDecorations'
export { MyAccountPage } from './MyAccountPage'

type CommerceProps = { products: HoneyProduct[] }

function money(value: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value) }
function getProduct(products: HoneyProduct[], line: CartLine) { return products.find((product) => product.id === line.productId) }

function Steps({ active }: { active: 1 | 2 | 3 }) {
  const steps = ['Shopping cart', 'Checkout details', 'Order complete']
  return (
    <div className="checkout-steps">
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isDone = active > stepNum
        const isActive = active === stepNum
        let stepClass = ''
        if (isDone) stepClass = 'is-done'
        else if (isActive) stepClass = 'is-active'

        return (
          <div className={stepClass} key={label}>
            <span>{isDone ? <Check size={14} strokeWidth={3} /> : stepNum}</span>
            <b>{label}</b>
          </div>
        )
      })}
    </div>
  )
}

function Quantity({ line }: { line: CartLine }) {
  const dispatch = useAppDispatch()
  return (
    <div className="cart-quantity">
      <button type="button" onClick={() => dispatch(setCartQuantity({ ...line, quantity: line.quantity - 1 }))}>
        <Minus size={12} />
      </button>
      <span>{line.quantity}</span>
      <button type="button" onClick={() => dispatch(setCartQuantity({ ...line, quantity: line.quantity + 1 }))}>
        <Plus size={12} />
      </button>
    </div>
  )
}

export function CartPage({ products }: CommerceProps) {
  const cart = useAppSelector((state) => state.commerce.cart)
  const dispatch = useAppDispatch()
  const [shipping, setShipping] = useState<'free' | 'express' | 'pickup'>('free')
  const shippingCost = shipping === 'express' ? 150 : 0
  const subtotal = cart.reduce((total, line) => total + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)

  return (
    <main className="commerce-page relative overflow-hidden">
      <NutDecorations />
      <div className="commerce-wrap relative z-10">
        <h1>Cart</h1>
        <Steps active={1} />
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h2>Your cart is waiting</h2>
            <p>Add a small-batch honey to continue.</p>
            <a href="#honey">Explore honey</a>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-products">
              <div className="cart-table-head">
                <span>Product</span>
                <span>Quantity</span>
                <span>Price</span>
              </div>
              {cart.map((line) => {
                const product = getProduct(products, line)
                if (!product) return null
                const originalPrice = Math.round(product.price * 1.06)
                return (
                  <article className="cart-line" key={`${line.productId}-${line.weight}`}>
                    <img src={product.image} alt={product.name} />
                    <div>
                      <a href={`#product/${product.slug}`}>{product.name}</a>
                      <small>(Weight: {line.weight})</small>
                      <button type="button" onClick={() => {
                        dispatch(removeFromCart(line))
                        toast.info('Item removed from cart')
                      }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                    <Quantity line={line} />
                    <strong className="cart-price-column">
                      <span>{money(product.price * line.quantity)}</span>
                      <del>{money(originalPrice * line.quantity)}</del>
                    </strong>
                  </article>
                )
              })}
              <div className="coupon-box">
                <h2>Have a coupon?</h2>
                <p>Add your code for an instant cart discount</p>
                <div className="coupon-input-wrap">
                  <Tag size={15} className="text-stone-400" />
                  <input placeholder="Coupon Code" />
                  <button type="button" onClick={() => toast.success('Coupon code applied!', { description: 'Discount will be reflected at checkout.' })}>Apply</button>
                </div>
              </div>
            </section>
            <aside className="cart-summary shadow-lg">
              <h2>Cart summary</h2>
              {[
                { id: 'free' as const, label: 'Free shipping', value: 0 },
                { id: 'express' as const, label: 'Express shipping', value: 150 },
                { id: 'pickup' as const, label: 'Pick Up', value: 0 },
              ].map((option) => (
                <label key={option.id} className={shipping === option.id ? 'is-selected' : ''}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === option.id}
                      onChange={() => setShipping(option.id)}
                    />
                    <span>{option.label}</span>
                  </div>
                  <b>{option.id === 'pickup' ? '%21.00' : option.value ? `+${money(option.value)}` : '$0.00'}</b>
                </label>
              ))}
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{money(subtotal + shippingCost)}</dd>
                </div>
              </dl>
              <a className="checkout-button font-bold text-white shadow-md hover:brightness-105 transition-all" href="#checkout">
                Checkout
              </a>
            </aside>
          </div>
        )}
      </div>
      <div className="commerce-bottom-bar" />
    </main>
  )
}

export function CheckoutPage({ products }: CommerceProps) {
  const cart = useAppSelector((state) => state.commerce.cart)
  const dispatch = useAppDispatch()
  const subtotal = cart.reduce((total, line) => total + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)
  const [couponCode, setCouponCode] = useState('JenkateMW')
  const [discountApplied, setDiscountApplied] = useState(true)

  if (!cart.length) return <CartPage products={products} />
  const discountAmount = discountApplied ? 25 : 0
  const finalTotal = Math.max(0, subtotal - discountAmount)

  return (
    <main className="commerce-page relative overflow-hidden">
      <NutDecorations />
      <div className="commerce-wrap checkout-wrap relative z-10">
        <h1>Check Out</h1>
        <Steps active={2} />
        <form
          className="checkout-layout"
          onSubmit={(event) => {
            event.preventDefault()
            dispatch(placeOrder())
            toast.success('Order placed successfully! 🎉', { description: 'Thank you for shopping with BossCo.' })
            window.location.hash = '#order-complete'
          }}
        >
          <div className="checkout-forms">
            <section className="shadow-md">
              <h2>Contact Infomation</h2>
              <div className="form-grid">
                <label>
                  FIRST NAME
                  <input required placeholder="First name" defaultValue="Sofia" />
                </label>
                <label>
                  LAST NAME
                  <input required placeholder="Last name" defaultValue="Havertz" />
                </label>
                <label className="span-2">
                  PHONE NUMBER
                  <input required placeholder="Phone number" defaultValue="(+1) 234 567 890" />
                </label>
                <label className="span-2">
                  EMAIL ADDRESS
                  <input required type="email" placeholder="Your Email" defaultValue="sofia.havertz@gmail.com" />
                </label>
              </div>
            </section>
            <section className="shadow-md">
              <h2>Shipping Address</h2>
              <div className="form-grid">
                <label className="span-2">
                  STREET ADDRESS *
                  <input required placeholder="Stress Address" defaultValue="345 Long Island" />
                </label>
                <label className="span-2">
                  COUNTRY *
                  <select required defaultValue="India">
                    <option value="" disabled>Country</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                  </select>
                </label>
                <label className="span-2">
                  TOWN / CITY *
                  <input required placeholder="Town / City" defaultValue="NewYork" />
                </label>
                <label>
                  STATE
                  <input required placeholder="State" defaultValue="NY" />
                </label>
                <label>
                  ZIP CODE
                  <input required placeholder="Zip Code" defaultValue="10001" />
                </label>
              </div>
              <label className="billing-checkbox-label flex items-center gap-2 mt-4 text-xs font-semibold text-stone-600 cursor-pointer">
                <input type="checkbox" className="rounded text-[#173f32]" defaultChecked />
                <span>Use a different billing address (optional)</span>
              </label>
            </section>
            <button className="place-order font-bold text-white shadow-md hover:brightness-105 transition-all" type="submit">
              Place order
            </button>
          </div>
          <aside className="order-summary shadow-lg">
            <h2>Order summary</h2>
            {cart.map((line) => {
              const product = getProduct(products, line)
              if (!product) return null
              return (
                <div className="summary-line" key={`${line.productId}-${line.weight}`}>
                  <img src={product.image} alt="" />
                  <span>
                    <b>{product.name}</b>
                    <small>Weight: {line.weight}</small>
                  </span>
                  <div className="summary-qty-box flex items-center gap-1.5 border border-stone-300 rounded px-2 py-0.5 text-xs font-bold">
                    <span>-</span> <span>{line.quantity}</span> <span>+</span>
                  </div>
                  <strong>{money(product.price * line.quantity)}</strong>
                </div>
              )
            })}
            <div className="summary-coupon">
              <input
                placeholder="Input"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  setDiscountApplied(true)
                  toast.success('Coupon applied!', { description: '$25.00 discount applied to order.' })
                }}
              >
                Apply
              </button>
            </div>
            {discountApplied && (
              <div className="applied-coupon-row flex items-center justify-between text-xs text-emerald-600 font-semibold mt-2.5">
                <div className="flex items-center gap-1.5">
                  <Tag size={13} />
                  <span>{couponCode || 'JenkateMW'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">-$25.00</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountApplied(false)
                      toast.info('Coupon removed')
                    }}
                    className="text-emerald-700 hover:underline font-normal"
                  >
                    [Remove]
                  </button>
                </div>
              </div>
            )}
            <dl>
              <div>
                <dt>Shipping</dt>
                <dd className="font-bold text-emerald-700">Free</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{money(finalTotal)}</dd>
              </div>
            </dl>
          </aside>
        </form>
      </div>
      <div className="commerce-bottom-bar" />
    </main>
  )
}

export function OrderCompletePage({ products }: CommerceProps) {
  const { lastOrder, lastOrderId } = useAppSelector((state) => state.commerce)
  const total = lastOrder.reduce((sum, line) => sum + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)
  return (
    <main className="commerce-page relative overflow-hidden">
      <NutDecorations />
      <div className="commerce-wrap complete-wrap relative z-10">
        <h1>Complete!</h1>
        <Steps active={3} />
        <section className="order-complete shadow-2xl">
          <p className="text-base text-stone-500 font-medium">Thank you! 🎉</p>
          <h2>Your order has been<br />received</h2>
          <div className="complete-images">
            {lastOrder.map((line) => {
              const product = getProduct(products, line)
              return (
                product && (
                  <span key={`${line.productId}-${line.weight}`}>
                    <img src={product.image} alt={product.name} />
                    <b>{line.quantity}</b>
                  </span>
                )
              )
            })}
          </div>
          <dl>
            <div>
              <dt>Order code:</dt>
              <dd>#{lastOrderId ?? '0123_45678'}</dd>
            </div>
            <div>
              <dt>Date:</dt>
              <dd>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt>Total:</dt>
              <dd>{money(total || 1345)}</dd>
            </div>
            <div>
              <dt>Payment method:</dt>
              <dd>Credit Card</dd>
            </div>
          </dl>
          <a href="#account" className="bg-[#D9B27C] hover:bg-[#c9a068] text-white font-bold px-6 py-2.5 rounded-full text-xs transition-colors shadow-md">
            Purchase history
          </a>
        </section>
      </div>
      <div className="commerce-bottom-bar" />
    </main>
  )
}

export function WishlistPage({ products }: CommerceProps) {
  const wishlist = useAppSelector((state) => state.commerce.wishlist)
  const dispatch = useAppDispatch()
  const wishedProducts = wishlist.map((id) => products.find((product) => product.id === id)).filter((product): product is HoneyProduct => Boolean(product))

  const addAllToCart = () => {
    wishedProducts.forEach((p) => {
      dispatch(addToCart({ productId: p.id, quantity: 1, weight: p.size }))
    })
    toast.success('All items added to cart! 🛒', { description: `${wishedProducts.length} items moved to your shopping bag.` })
  }

  return (
    <main className="commerce-page wishlist-page relative overflow-hidden bg-stone-50/50 dark:bg-stone-950">
      <NutDecorations />
      <div className="commerce-wrap relative z-10 mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
        <div className="wishlist-heading text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 dark:bg-stone-900 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shadow-sm">
            <Heart size={14} className="text-amber-600 fill-amber-600" /> Your Private Collection
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold text-[#173f32] dark:text-stone-100 tracking-tight">
            Saved Favourites
          </h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            The rare jars and artisan honey varieties you loved, ready for your kitchen shelf.
          </p>
          {wishedProducts.length > 0 && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={addAllToCart}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#173f32] hover:bg-[#205443] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
              >
                <ShoppingBag size={15} /> Add All ({wishedProducts.length}) to Cart
              </button>
            </div>
          )}
        </div>

        {wishedProducts.length === 0 ? (
          <div className="empty-cart text-center py-20 px-6 max-w-md mx-auto bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl">
            <div className="size-20 mx-auto mb-6 grid place-items-center rounded-full bg-amber-50 dark:bg-stone-800 text-amber-600 shadow-inner">
              <Heart size={36} className="text-amber-500 animate-pulse" />
            </div>
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">Your collection is empty</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Save your favourite honey varieties using the heart button while browsing our catalog.
            </p>
            <a
              href="#honey"
              className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#173f32] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#225746] transition"
            >
              Explore Honey Room
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {wishedProducts.map((product) => (
              <article
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                key={product.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-stone-900/90 text-[#173f32] dark:text-amber-400 backdrop-blur-md shadow-sm">
                    {product.category}
                  </span>
                  <button
                    className="absolute top-3 right-3 size-9 grid place-items-center rounded-full bg-white/90 dark:bg-stone-900/90 text-rose-500 hover:bg-rose-50 hover:text-rose-600 shadow-md backdrop-blur-md transition-all hover:scale-110"
                    type="button"
                    onClick={() => {
                      dispatch(toggleWishlist(product.id))
                      toast.info('Removed from wishlist', { description: `${product.name} removed.` })
                    }}
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-6 text-left">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                    <span className="font-semibold">{product.origin}</span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold uppercase">{product.size}</span>
                  </div>

                  <a href={`#product/${product.slug}`} className="group-hover:text-amber-700 transition-colors">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">{product.name}</h2>
                  </a>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{product.subtitle}</p>

                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                    <span className="font-display text-2xl font-bold text-[#173f32] dark:text-amber-400">
                      {money(product.price)}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#173f32] hover:bg-[#235847] text-white text-xs font-bold transition shadow-sm"
                      onClick={() => {
                        dispatch(addToCart({ productId: product.id, quantity: 1, weight: product.size }))
                        toast.success('Added to cart! 🛒', { description: `${product.name} (${product.size}) added.` })
                      }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="commerce-bottom-bar" />
    </main>
  )
}
