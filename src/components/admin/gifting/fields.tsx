import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import { GIFT_ICONS, type GiftIcon } from '../../../types/api'
import { GiftIconView } from '../../gifts/giftIcons'
import { btn, input, label as labelClass } from '../styles'
import { Spinner } from '../ui'

export function TextField({ label, value, onChange, maxLength, required, multiline, hint, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  required?: boolean
  multiline?: boolean
  hint?: ReactNode
  placeholder?: string
  type?: 'text' | 'tel'
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {multiline ? (
        <textarea id={id} rows={3} value={value} maxLength={maxLength} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={input} />
      ) : (
        <input id={id} type={type} value={value} maxLength={maxLength} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={input} />
      )}
      {hint && <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{hint}</p>}
    </div>
  )
}

/** Rupee amount; empty means "no limit". */
export function PriceField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        step="1"
        value={value ?? ''}
        placeholder="No limit"
        onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        className={input}
      />
    </div>
  )
}

export function IconSelect({ value, onChange }: { value: GiftIcon; onChange: (value: GiftIcon) => void }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>Icon</label>
      <div className="flex items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f6ead4] text-[#b9773a]" aria-hidden><GiftIconView name={value} /></span>
        <select id={id} value={value} onChange={(event) => onChange(event.target.value as GiftIcon)} className={input}>
          {GIFT_ICONS.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
    </div>
  )
}

/** Shows the current image with upload / remove buttons; uploads happen immediately. */
export function ImageSlot({ label, url, fallbackNote, busy, onUpload, onRemove }: {
  label: string
  url: string | null
  fallbackNote: string
  busy: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const file = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-stone-200 p-3 dark:border-stone-700">
        <div className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
          {url ? <img src={url} alt="" className="size-full object-cover" /> : <ImagePlus className="text-stone-400" size={22} aria-hidden />}
        </div>
        <div className="grid gap-2">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">{url ? 'Shown on the page now.' : fallbackNote} JPG, PNG or WebP, up to 5 MB.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn.small} disabled={busy} onClick={() => file.current?.click()}>
              {busy ? <Spinner className="size-3" /> : <ImagePlus size={13} />} {url ? 'Replace' : 'Upload'}
            </button>
            {url && <button type="button" className={btn.dangerGhost} disabled={busy} onClick={onRemove}><Trash2 size={13} /> Remove</button>}
          </div>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            event.target.value = ''
            if (selected) onUpload(selected)
          }}
        />
      </div>
    </div>
  )
}

/** Editable list of rows with add / remove, capped at `max`. */
export function ListEditor<T>({ items, max, addLabel, onChange, create, render }: {
  items: T[]
  max: number
  addLabel: string
  onChange: (items: T[]) => void
  create: () => T
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode
}) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="relative rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80 dark:bg-stone-950/40 dark:ring-stone-800">
          <button
            type="button"
            aria-label={`Remove item ${index + 1}`}
            className={`${btn.icon} absolute right-2 top-2 size-8`}
            onClick={() => onChange(items.filter((_, position) => position !== index))}
          >
            <Trash2 size={14} />
          </button>
          <div className="pr-8">{render(item, (patch) => onChange(items.map((current, position) => (position === index ? { ...current, ...patch } : current))))}</div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className={`${btn.small} justify-self-start`} onClick={() => onChange([...items, create()])}>
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  )
}
