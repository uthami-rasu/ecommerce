import { useState } from 'react'
import { CreditCard, MapPin, Pencil, Phone, Plus, RotateCw, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '../auth/FormBits'
import { useDeleteAddressMutation, useGetAddressesQuery, useUpdateAddressMutation } from '../../features/account/accountApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Address, UserProfile } from '../../types/api'
import { formatAddress, fullName } from '../../utils/format'
import { AccountSection, EmptyState, SecondaryButton } from './AccountSection'
import { AddressDialog } from './AddressDialog'

const addButton = 'inline-flex h-10 items-center gap-2 rounded-full bg-[#173f32] px-5 text-[13px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(23,63,50,0.8)] transition hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 dark:bg-[#D9B27C] dark:text-stone-950 dark:hover:bg-[#e4c08d]'

function DefaultBadge({ icon: Icon, children }: { icon: typeof Truck; children: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#173f32]/8 px-2.5 py-1 text-[11px] font-bold text-[#173f32] ring-1 ring-[#173f32]/15 dark:bg-amber-200/10 dark:text-amber-100 dark:ring-amber-200/20">
      <Icon size={12} /> {children}
    </span>
  )
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [remove, removeState] = useDeleteAddressMutation()
  const [update, updateState] = useUpdateAddressMutation()
  const isDefault = address.isDefaultShipping || address.isDefaultBilling

  const makeDefault = async (field: 'isDefaultShipping' | 'isDefaultBilling') => {
    try {
      await update({ id: address.id, [field]: true }).unwrap()
      toast.success(field === 'isDefaultShipping' ? 'Default shipping address updated' : 'Default billing address updated')
    } catch (error) {
      toast.error('Could not update address', { description: errorMessage(error) })
    }
  }

  const destroy = async () => {
    try {
      await remove(address.id).unwrap()
      toast.success('Address deleted')
    } catch (error) {
      toast.error('Could not delete address', { description: errorMessage(error) })
      setConfirming(false)
    }
  }

  return (
    <article className={`group relative flex flex-col rounded-2xl border bg-white p-5 transition hover:shadow-[0_18px_40px_-24px_rgba(23,63,50,0.45)] dark:bg-stone-900 ${isDefault ? 'border-[#D9B27C]/70 dark:border-amber-200/30' : 'border-stone-200 dark:border-stone-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#fbf3e6] text-[#aa753a] dark:bg-amber-200/10 dark:text-amber-200"><MapPin size={16} /></span>
          <h3 className="truncate text-[15px] font-bold text-stone-900 dark:text-stone-50">{address.label || 'Address'}</h3>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} className="grid size-9 place-items-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-[#173f32] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/30 dark:hover:bg-stone-800 dark:hover:text-amber-100" aria-label={`Edit ${address.label || 'address'}`}>
            <Pencil size={15} />
          </button>
          <button type="button" onClick={() => setConfirming(true)} className="grid size-9 place-items-center rounded-full text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 dark:hover:bg-rose-950/40" aria-label={`Delete ${address.label || 'address'}`}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {(address.isDefaultShipping || address.isDefaultBilling) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {address.isDefaultShipping && <DefaultBadge icon={Truck}>Default shipping</DefaultBadge>}
          {address.isDefaultBilling && <DefaultBadge icon={CreditCard}>Default billing</DefaultBadge>}
        </div>
      )}

      <div className="mt-4 space-y-1 text-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">{fullName(address)}</p>
        <p className="leading-relaxed text-stone-600 dark:text-stone-400">{formatAddress(address)}</p>
        <p className="flex items-center gap-1.5 pt-1 text-stone-500 dark:text-stone-400"><Phone size={13} /> {address.phone}</p>
      </div>

      <div className="min-h-5 flex-1" />
      {(!address.isDefaultShipping || !address.isDefaultBilling) && (
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
          {!address.isDefaultShipping && (
            <button type="button" disabled={updateState.isLoading} onClick={() => makeDefault('isDefaultShipping')} className="font-semibold text-[#aa753a] underline-offset-4 hover:text-[#173f32] hover:underline disabled:opacity-50 dark:text-[#e4c08d] dark:hover:text-white">
              Set as default shipping
            </button>
          )}
          {!address.isDefaultBilling && (
            <button type="button" disabled={updateState.isLoading} onClick={() => makeDefault('isDefaultBilling')} className="font-semibold text-[#aa753a] underline-offset-4 hover:text-[#173f32] hover:underline disabled:opacity-50 dark:text-[#e4c08d] dark:hover:text-white">
              Set as default billing
            </button>
          )}
        </div>
      )}

      {confirming && (
        <div role="alertdialog" aria-label="Delete this address?" className="account-swap absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 p-5 text-center backdrop-blur-sm dark:bg-stone-900/95">
          <p className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">Delete this address?</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{address.label || 'This address'} will be removed from your account. Past orders keep their copy.</p>
          <div className="mt-1 flex gap-2">
            <SecondaryButton onClick={() => setConfirming(false)} disabled={removeState.isLoading} autoFocus>Keep it</SecondaryButton>
            <button type="button" onClick={destroy} disabled={removeState.isLoading} className="inline-flex h-10 items-center gap-2 rounded-full bg-rose-600 px-5 text-[13px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60">
              {removeState.isLoading ? <Spinner /> : <Trash2 size={14} />} Delete
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export function AddressesTab({ user }: { user: UserProfile }) {
  const { data: addresses, isLoading, isError, error, refetch, isFetching } = useGetAddressesQuery()
  const [editing, setEditing] = useState<Address | 'new' | null>(null)
  const list = addresses ?? []

  return (
    <AccountSection
      title="Addresses"
      description="Saved addresses make checkout a one-tap affair."
      actions={list.length > 0 && <button type="button" className={addButton} onClick={() => setEditing('new')}><Plus size={16} /> Add address</button>}
    >
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading addresses">
          {[0, 1].map((key) => (
            <div key={key} className="h-48 animate-pulse rounded-2xl border border-stone-200 bg-stone-100/70 dark:border-stone-800 dark:bg-stone-800/50" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState icon={MapPin} title="Couldn’t load your addresses" action={<SecondaryButton onClick={() => refetch()} disabled={isFetching}><RotateCw size={15} /> Try again</SecondaryButton>}>
          {errorMessage(error)}
        </EmptyState>
      ) : list.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses yet" action={<button type="button" className={addButton} onClick={() => setEditing('new')}><Plus size={16} /> Add your first address</button>}>
          Add a delivery address now and breeze through checkout next time.
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((address) => <AddressCard key={address.id} address={address} onEdit={() => setEditing(address)} />)}
        </div>
      )}

      {editing && (
        <AddressDialog
          key={editing === 'new' ? 'new' : editing.id}
          address={editing === 'new' ? null : editing}
          user={user}
          isFirst={list.length === 0}
          onClose={() => setEditing(null)}
        />
      )}
    </AccountSection>
  )
}
