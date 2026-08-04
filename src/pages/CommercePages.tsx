import { Check, ChevronRight, Heart, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addToCart, placeOrder, removeFromCart, setCartQuantity, toggleWishlist } from '../features/commerce/commerceSlice'
import type { CartLine } from '../features/commerce/commerceSlice'
import type { HoneyProduct } from '../types/catalog'

type CommerceProps = { products: HoneyProduct[] }

function money(value: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value) }
function getProduct(products: HoneyProduct[], line: CartLine) { return products.find((product) => product.id === line.productId) }

function Steps({ active }: { active: 1 | 2 | 3 }) {
  return <div className="checkout-steps">{['Shopping cart', 'Checkout details', 'Order complete'].map((label, index) => <div className={active >= index + 1 ? 'is-active' : ''} key={label}><span>{active > index + 1 ? <Check size={13} /> : index + 1}</span><b>{label}</b></div>)}</div>
}

function Quantity({ line }: { line: CartLine }) {
  const dispatch = useAppDispatch()
  return <div className="cart-quantity"><button type="button" onClick={() => dispatch(setCartQuantity({ ...line, quantity: line.quantity - 1 }))}><Minus size={12} /></button><span>{line.quantity}</span><button type="button" onClick={() => dispatch(setCartQuantity({ ...line, quantity: line.quantity + 1 }))}><Plus size={12} /></button></div>
}

export function CartPage({ products }: CommerceProps) {
  const cart = useAppSelector((state) => state.commerce.cart)
  const dispatch = useAppDispatch()
  const [shipping, setShipping] = useState<'free' | 'express' | 'pickup'>('free')
  const shippingCost = shipping === 'express' ? 150 : 0
  const subtotal = cart.reduce((total, line) => total + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)
  return <main className="commerce-page"><div className="commerce-wrap"><h1>Cart</h1><Steps active={1} />{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={34} /><h2>Your cart is waiting</h2><p>Add a small-batch honey to continue.</p><a href="#honey">Explore honey</a></div> : <div className="cart-layout"><section className="cart-products"><div className="cart-table-head"><span>Product</span><span>Quantity</span><span>Price</span></div>{cart.map((line) => { const product = getProduct(products, line); if (!product) return null; return <article className="cart-line" key={`${line.productId}-${line.weight}`}><img src={product.image} alt={product.name} /><div><a href={`#product/${product.slug}`}>{product.name}</a><small>Weight: {line.weight}</small><button type="button" onClick={() => dispatch(removeFromCart(line))}><Trash2 size={12} /> Remove</button></div><Quantity line={line} /><strong>{money(product.price * line.quantity)}</strong></article>})}<div className="coupon-box"><h2>Have a coupon?</h2><p>Add your code for an instant cart discount</p><div><Tag size={15} /><input placeholder="Coupon code" /><button type="button">Apply</button></div></div></section><aside className="cart-summary"><h2>Cart summary</h2>{[{ id: 'free' as const, label: 'Free shipping', value: 0 }, { id: 'express' as const, label: 'Express shipping', value: 150 }, { id: 'pickup' as const, label: 'Pick up', value: 0 }].map((option) => <label key={option.id}><input type="radio" name="shipping" checked={shipping === option.id} onChange={() => setShipping(option.id)} /><span>{option.label}</span><b>{option.value ? `+${money(option.value)}` : 'Free'}</b></label>)}<dl><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Total</dt><dd>{money(subtotal + shippingCost)}</dd></div></dl><a className="checkout-button" href="#checkout">Checkout <ChevronRight size={15} /></a></aside></div>}</div></main>
}

export function CheckoutPage({ products }: CommerceProps) {
  const cart = useAppSelector((state) => state.commerce.cart)
  const dispatch = useAppDispatch()
  const subtotal = cart.reduce((total, line) => total + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)
  if (!cart.length) return <CartPage products={products} />
  return <main className="commerce-page"><div className="commerce-wrap checkout-wrap"><h1>Check Out</h1><Steps active={2} /><form className="checkout-layout" onSubmit={(event) => { event.preventDefault(); dispatch(placeOrder()); window.location.hash = '#order-complete' }}><div className="checkout-forms"><section><h2>Contact information</h2><div className="form-grid"><label>First name<input required placeholder="First name" /></label><label>Last name<input required placeholder="Last name" /></label><label className="span-2">Phone number<input required placeholder="Phone number" /></label><label className="span-2">Email address<input required type="email" placeholder="Your email" /></label></div></section><section><h2>Shipping address</h2><div className="form-grid"><label className="span-2">Street address<input required placeholder="Street address" /></label><label className="span-2">Country<select required defaultValue=""><option value="" disabled>Country</option><option>India</option></select></label><label className="span-2">Town / City<input required placeholder="Town / City" /></label><label>State<input required placeholder="State" /></label><label>ZIP code<input required placeholder="ZIP code" /></label></div></section><section><h2>Payment method</h2><label className="payment-choice"><input type="radio" defaultChecked name="payment" /> Pay by card</label><label className="payment-choice"><input type="radio" name="payment" /> UPI / PayPal</label><div className="form-grid payment-fields"><label className="span-2">Card number<input required placeholder="1234 1234 1234 1234" /></label><label>Expiration date<input required placeholder="MM/YY" /></label><label>CVC<input required placeholder="CVC" /></label></div></section><button className="place-order" type="submit">Place order</button></div><aside className="order-summary"><h2>Order summary</h2>{cart.map((line) => { const product = getProduct(products, line); if (!product) return null; return <div className="summary-line" key={`${line.productId}-${line.weight}`}><img src={product.image} alt="" /><span><b>{product.name}</b><small>{line.weight} · Qty {line.quantity}</small></span><strong>{money(product.price * line.quantity)}</strong></div>})}<div className="summary-coupon"><input placeholder="Coupon code" /><button type="button">Apply</button></div><dl><div><dt>Shipping</dt><dd>Free</dd></div><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Total</dt><dd>{money(subtotal)}</dd></div></dl></aside></form></div></main>
}

export function OrderCompletePage({ products }: CommerceProps) {
  const { lastOrder, lastOrderId } = useAppSelector((state) => state.commerce)
  const total = lastOrder.reduce((sum, line) => sum + (getProduct(products, line)?.price ?? 0) * line.quantity, 0)
  return <main className="commerce-page"><div className="commerce-wrap complete-wrap"><h1>Complete!</h1><Steps active={3} /><section className="order-complete"><span className="complete-check"><Check size={24} /></span><p>Thank you!</p><h2>Your order has been<br />received</h2><div className="complete-images">{lastOrder.map((line) => { const product = getProduct(products, line); return product && <span key={`${line.productId}-${line.weight}`}><img src={product.image} alt={product.name} /><b>{line.quantity}</b></span>})}</div><dl><div><dt>Order code</dt><dd>#{lastOrderId ?? 'BSC-PENDING'}</dd></div><div><dt>Date</dt><dd>{new Date().toLocaleDateString('en-IN')}</dd></div><div><dt>Total</dt><dd>{money(total)}</dd></div><div><dt>Payment method</dt><dd>Card / Digital payment</dd></div></dl><a href="#honey">Continue shopping</a></section></div></main>
}

export function WishlistPage({ products }: CommerceProps) {
  const wishlist = useAppSelector((state) => state.commerce.wishlist)
  const dispatch = useAppDispatch()
  const wishedProducts = wishlist.map((id) => products.find((product) => product.id === id)).filter((product): product is HoneyProduct => Boolean(product))
  return <main className="commerce-page wishlist-page"><div className="commerce-wrap"><div className="wishlist-heading"><span><Heart size={17} fill="currentColor" /> Your collection</span><h1>Saved favourites</h1><p>The jars you loved, gathered in one place.</p></div>{wishedProducts.length === 0 ? <div className="empty-cart"><Heart size={34} /><h2>Your wishlist is empty</h2><p>Save a honey using the heart icon and it will appear here.</p><a href="#honey">Explore honey</a></div> : <div className="wishlist-grid">{wishedProducts.map((product) => <article className="wishlist-card" key={product.id}><a className="wishlist-image" href={`#product/${product.slug}`}><img src={product.image} alt={product.name} /><span>{product.category}</span></a><button className="wishlist-remove" type="button" onClick={() => dispatch(toggleWishlist(product.id))} aria-label={`Remove ${product.name} from wishlist`}><Heart size={17} fill="currentColor" /></button><div><small>{product.origin} · {product.size}</small><a href={`#product/${product.slug}`}><h2>{product.name}</h2></a><p>{product.subtitle}</p><footer><strong>{money(product.price)}</strong><button type="button" onClick={() => dispatch(addToCart({ productId: product.id, quantity: 1, weight: product.size }))}><ShoppingBag size={14} /> Add to cart</button></footer></div></article>)}</div>}</div></main>
}
