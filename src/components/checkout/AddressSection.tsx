import type { Address } from '../../types/api'
import { AddressForm } from './AddressForm'
import { AddressPicker, NEW_ADDRESS } from './AddressPicker'
import type { AddressDraft, AddressErrors } from './addressValidation'
import { CheckToggle } from './CheckToggle'
import { Skeleton } from './Skeleton'

type AddressSectionProps = {
  idPrefix: string
  addresses: Address[] | undefined
  loading: boolean
  loadError?: string
  choice: string
  onChoice: (choice: string) => void
  draft: AddressDraft
  onDraft: (draft: AddressDraft) => void
  errors: AddressErrors
  save: boolean
  onSave: (save: boolean) => void
}

/** Pick a saved address or enter a new one (optionally saving it to the address book). */
export function AddressSection({ idPrefix, addresses, loading, loadError, choice, onChoice, draft, onDraft, errors, save, onSave }: AddressSectionProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label="Loading saved addresses">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    )
  }
  const hasSaved = Boolean(addresses?.length)
  return (
    <div className="grid gap-5">
      {loadError && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Couldn’t load your saved addresses ({loadError}). You can enter one below.</p>}
      {hasSaved && <AddressPicker name={`${idPrefix}-choice`} addresses={addresses ?? []} value={choice} onChange={onChoice} />}
      {choice === NEW_ADDRESS && (
        <div className={`checkout-fade-in grid gap-4 ${hasSaved ? 'rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-950/40' : ''}`}>
          <AddressForm idPrefix={idPrefix} value={draft} errors={errors} onChange={onDraft} showLabel={save} />
          <CheckToggle id={`${idPrefix}-save`} checked={save} onChange={onSave}>Save to my address book</CheckToggle>
        </div>
      )}
    </div>
  )
}
