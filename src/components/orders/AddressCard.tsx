import type { OrderAddress } from '../../types/api'
import { formatAddress, fullName } from '../../utils/format'

/** Read-only postal address block. */
export function AddressCard({ title, address, note }: { title: string; address: OrderAddress; note?: string }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">{title}</h3>
      {note ? (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{note}</p>
      ) : (
        <address className="mt-2 text-sm not-italic leading-relaxed text-stone-600 dark:text-stone-300">
          <b className="block font-bold text-stone-800 dark:text-stone-100">{fullName(address)}</b>
          {formatAddress(address)}
          <span className="mt-1 block text-xs text-stone-400">{address.phone}</span>
        </address>
      )}
    </div>
  )
}
