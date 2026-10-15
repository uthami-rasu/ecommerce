import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AlertTriangle, CreditCard, Mail, MapPin, NotebookPen, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { AddressSection } from '../../components/checkout/AddressSection'
import { NEW_ADDRESS } from '../../components/checkout/AddressPicker'
import { emptyAddress, toAddressFields, validateAddress, type AddressDraft, type AddressErrors } from '../../components/checkout/addressValidation'
import { CheckoutShell } from '../../components/checkout/CheckoutShell'
import { CheckoutSummary } from '../../components/checkout/CheckoutSummary'
import { CheckToggle } from '../../components/checkout/CheckToggle'
import { FormField } from '../../components/checkout/FormField'
import { inputBorder, inputClass } from '../../components/checkout/formStyles'
import { Panel } from '../../components/checkout/Panel'
import { ShippingOptions } from '../../components/checkout/ShippingOptions'
import { Skeleton } from '../../components/checkout/Skeleton'
import { loadShippingMethod, saveShippingMethod } from '../../components/checkout/checkoutConstants'
import { useCreateAddressMutation, useGetAddressesQuery } from '../../features/account/accountApi'
import { usePlaceOrderMutation } from '../../features/orders/ordersApi'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { errorMessage } from '../../lib/http/apiClient'
import type { Address, CheckoutInput, ShippingMethod } from '../../types/api'
import { navigate } from '../../utils/router'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Saved default (or first) address, else the new-address form. */
const initialChoice = (addresses: Address[] | undefined, key: 'isDefaultShipping' | 'isDefaultBilling') =>
  addresses?.find((address) => address[key])?.id ?? addresses?.[0]?.id ?? NEW_ADDRESS

type AddressState = { choice: string | null; draft: AddressDraft; save: boolean; errors: AddressErrors }

export function CheckoutPage() {
  const { user } = useAuth()
  const [method, setMethod] = useState<ShippingMethod>(loadShippingMethod)
  const { cart, isLoading: cartLoading, isFetching: cartFetching, error: cartError } = useCart(method)
  const addressesQuery = useGetAddressesQuery()
  const addresses = addressesQuery.data
  const [createAddress] = useCreateAddressMutation()
  const [placeOrder] = usePlaceOrderMutation()

  const [email, setEmail] = useState(user?.email ?? '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<AddressState>(() => ({ choice: null, draft: emptyAddress(user), save: true, errors: {} }))
  const [billingSame, setBillingSame] = useState(true)
  const [billing, setBilling] = useState<AddressState>(() => ({ choice: null, draft: emptyAddress(user), save: false, errors: {} }))
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const placed = useRef(false)

  // The user's choice wins; until they pick, follow the address book's default.
  const shipChoice = shipping.choice ?? initialChoice(addresses, 'isDefaultShipping')
  const billChoice = billing.choice ?? initialChoice(addresses, 'isDefaultBilling')

  // Nothing to check out (or the order was just placed and emptied the cart).
  useEffect(() => {
    if (!placed.current && cart && cart.items.length === 0) navigate('cart', { replace: true })
  }, [cart])

  const chooseMethod = (next: ShippingMethod) => {
    setMethod(next)
    saveShippingMethod(next)
  }

  /** Returns the payload fragment for one address, saving a new one first when asked. */
  const resolveAddress = async (state: AddressState, choice: string, kind: 'shipping' | 'billing') => {
    if (choice !== NEW_ADDRESS) return { id: choice }
    const fields = toAddressFields(state.draft)
    if (!state.save) return { inline: fields }
    const saved = await createAddress({
      ...fields,
      label: state.draft.label.trim() || undefined,
      isDefaultShipping: kind === 'shipping' && !addresses?.length ? true : undefined,
      isDefaultBilling: kind === 'billing' && !addresses?.length ? true : undefined,
    }).unwrap()
    // A retry after a failed order must not save the same address twice.
    const update = kind === 'shipping' ? setShipping : setBilling
    update((current) => ({ ...current, choice: saved.id, save: false }))
    toast.success('Address saved to your address book')
    return { id: saved.id }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!cart || submitting) return
    setFormError(null)

    const nextEmailError = EMAIL.test(email.trim()) ? null : 'Enter a valid email address'
    const shipErrors = shipChoice === NEW_ADDRESS ? validateAddress(shipping.draft) : {}
    const billErrors = !billingSame && billChoice === NEW_ADDRESS ? validateAddress(billing.draft) : {}
    setEmailError(nextEmailError)
    setShipping((current) => ({ ...current, errors: shipErrors }))
    setBilling((current) => ({ ...current, errors: billErrors }))
    if (nextEmailError || Object.keys(shipErrors).length || Object.keys(billErrors).length) {
      toast.error('Please check the highlighted fields')
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const ship = await resolveAddress(shipping, shipChoice, 'shipping')
      const bill = billingSame ? null : await resolveAddress(billing, billChoice, 'billing')
      const input: CheckoutInput = {
        shippingMethod: method,
        email: email.trim(),
        notes: notes.trim() || undefined,
        ...('id' in ship ? { shippingAddressId: ship.id } : { shippingAddress: ship.inline }),
        ...(bill ? ('id' in bill ? { billingAddressId: bill.id } : { billingAddress: bill.inline }) : {}),
      }
      placed.current = true
      const order = await placeOrder(input).unwrap()
      toast.success('Order placed', { description: `Order ${order.orderNumber} is ready for payment.` })
      navigate(`pay/${order.orderNumber}`)
    } catch (err) {
      placed.current = false
      const message = errorMessage(err)
      setFormError(message)
      toast.error('Could not place your order', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  if (cartLoading || !cart || cart.items.length === 0) {
    return (
      <CheckoutShell title="Check out" step={2} width="medium">
        {cartError && !cartLoading ? (
          <p className="mx-auto max-w-md rounded-2xl bg-rose-50 px-5 py-4 text-center text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
            {errorMessage(cartError)}
          </p>
        ) : (
          <CheckoutSkeleton />
        )}
      </CheckoutShell>
    )
  }

  const unavailable = cart.items.filter((line) => !line.available)

  return (
    <CheckoutShell title="Check out" step={2} width="medium">
      <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)] lg:gap-8">
        <div className="grid gap-6">
          {formError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
              <AlertTriangle size={17} className="mt-0.5 flex-none" aria-hidden />
              <div><b className="font-bold">We couldn’t place your order.</b> {formError}</div>
            </div>
          )}
          {unavailable.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" role="alert">
              <AlertTriangle size={17} className="mt-0.5 flex-none" aria-hidden />
              <div>
                {unavailable.map((line) => line.name).join(', ')} {unavailable.length === 1 ? 'is' : 'are'} no longer available.{' '}
                <a href="#cart" className="font-bold underline">Update your cart</a> to continue.
              </div>
            </div>
          )}

          <Panel title="Contact information" subtitle="We’ll send your receipt and delivery updates here." icon={<Mail size={17} />}>
            <FormField id="checkout-email" label="Email address" error={emailError ?? undefined}>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailError(null)
                }}
                aria-invalid={Boolean(emailError) || undefined}
                aria-describedby={emailError ? 'checkout-email-error' : undefined}
                className={`${inputClass} ${inputBorder(Boolean(emailError))}`}
                required
              />
            </FormField>
          </Panel>

          <Panel title="Shipping address" subtitle="Where should we deliver?" icon={<MapPin size={17} />}>
            <AddressSection
              idPrefix="ship"
              addresses={addresses}
              loading={addressesQuery.isLoading}
              loadError={addressesQuery.error ? errorMessage(addressesQuery.error) : undefined}
              choice={shipChoice}
              onChoice={(choice) => setShipping((current) => ({ ...current, choice, errors: {} }))}
              draft={shipping.draft}
              onDraft={(draft) => setShipping((current) => ({ ...current, draft, errors: {} }))}
              errors={shipping.errors}
              save={shipping.save}
              onSave={(save) => setShipping((current) => ({ ...current, save }))}
            />
          </Panel>

          <Panel title="Billing address" icon={<CreditCard size={17} />}>
            <CheckToggle id="billing-same" checked={billingSame} onChange={setBillingSame}>Same as shipping address</CheckToggle>
            {!billingSame && (
              <div className="checkout-fade-in mt-5">
                <AddressSection
                  idPrefix="bill"
                  addresses={addresses}
                  loading={addressesQuery.isLoading}
                  choice={billChoice}
                  onChoice={(choice) => setBilling((current) => ({ ...current, choice, errors: {} }))}
                  draft={billing.draft}
                  onDraft={(draft) => setBilling((current) => ({ ...current, draft, errors: {} }))}
                  errors={billing.errors}
                  save={billing.save}
                  onSave={(save) => setBilling((current) => ({ ...current, save }))}
                />
              </div>
            )}
          </Panel>

          <Panel title="Shipping method" icon={<Truck size={17} />}>
            {cart.shippingOptions.length ? (
              <ShippingOptions options={cart.shippingOptions} value={method} onChange={chooseMethod} disabled={submitting} name="checkout-shipping" />
            ) : (
              <p className="text-sm text-stone-500">Shipping options will appear once your cart loads.</p>
            )}
          </Panel>

          <Panel title="Order notes" subtitle="Gift message or delivery instructions." icon={<NotebookPen size={17} />}>
            <label htmlFor="checkout-notes" className="sr-only">Order notes</label>
            <textarea
              id="checkout-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 500))}
              rows={3}
              placeholder="e.g. Please leave the parcel with the security desk."
              className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#D9B27C] focus:ring-4 focus:ring-[#D9B27C]/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
            <p className="mt-1 text-right text-xs tabular-nums text-stone-400">{notes.length}/500</p>
          </Panel>
        </div>

        <CheckoutSummary cart={cart} busy={cartFetching} submitting={submitting} blocked={unavailable.length > 0} />
      </form>
    </CheckoutShell>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)] lg:gap-8" role="status" aria-label="Loading checkout">
      <div className="grid gap-6">
        {[0, 1, 2].map((key) => (
          <Panel key={key}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-5 h-12 rounded-xl" />
            <Skeleton className="mt-3 h-12 w-2/3 rounded-xl" />
          </Panel>
        ))}
      </div>
      <Panel>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-5 h-14" />
        <Skeleton className="mt-3 h-14" />
        <Skeleton className="mt-6 h-12 rounded-2xl" />
      </Panel>
    </div>
  )
}
