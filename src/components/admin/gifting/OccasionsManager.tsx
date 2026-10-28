import { CalendarHeart, Edit2, Gift, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  useCreateGiftOccasionMutation,
  useDeleteGiftOccasionMutation,
  useGetAdminGiftOccasionsQuery,
  useUpdateGiftOccasionMutation,
  useUploadGiftOccasionImageMutation,
} from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { AdminGiftOccasion } from '../../../types/api'
import { Dialog } from '../Dialog'
import { btn, input, label as labelClass } from '../styles'
import { Card, CardHeader, EmptyState, ErrorState, InlineError, Skeleton, Spinner, Switch } from '../ui'
import { ImageSlot, TextField } from './fields'

type Editing = AdminGiftOccasion | 'new' | null

export function OccasionsManager() {
  const { data, isLoading, error, refetch } = useGetAdminGiftOccasionsQuery()
  const [update] = useUpdateGiftOccasionMutation()
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<AdminGiftOccasion | null>(null)

  const toggle = async (occasion: AdminGiftOccasion, patch: Partial<Pick<AdminGiftOccasion, 'isActive' | 'isFeatured'>>) => {
    try {
      await update({ id: occasion.id, ...patch }).unwrap()
    } catch (err) {
      toast.error(`Couldn’t update ${occasion.name}`, { description: errorMessage(err) })
    }
  }

  return (
    <Card>
      <CardHeader
        icon={CalendarHeart}
        title="Occasions"
        description="Filter chips on the page. Hidden occasions hide their products from the page too."
        action={<button type="button" className={btn.smallPrimary} onClick={() => setEditing('new')}><Plus size={13} /> Add occasion</button>}
      />
      {isLoading ? (
        <div className="grid gap-3 p-5">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-16" />)}</div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon={Gift} title="No occasions yet" action={<button type="button" className={btn.primary} onClick={() => setEditing('new')}>Add the first occasion</button>}>
          Occasions group your return gifts — e.g. Weddings or Corporate Events.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {data.map((occasion) => (
            <li key={occasion.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#173f32]/10">
                {occasion.imageUrl ? <img src={occasion.imageUrl} alt="" className="size-full object-cover" /> : <Gift size={20} className="text-[#173f32]/50" aria-hidden />}
              </span>
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold text-stone-900 dark:text-stone-50">
                  {occasion.name} <span className="ml-1 font-mono text-[11px] font-normal text-stone-400">/{occasion.slug}</span>
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {occasion.productCount} {occasion.productCount === 1 ? 'product' : 'products'} · order {occasion.sortOrder}
                  {occasion.tagline ? ` · ${occasion.tagline}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <div className="w-36"><Switch checked={occasion.isActive} onChange={(isActive) => void toggle(occasion, { isActive })} label="Visible" /></div>
                <div className="w-40"><Switch checked={occasion.isFeatured} onChange={(isFeatured) => void toggle(occasion, { isFeatured })} label="Show as card" /></div>
                <div className="flex gap-1">
                  <button type="button" className={btn.icon} aria-label={`Edit ${occasion.name}`} onClick={() => setEditing(occasion)}><Edit2 size={15} /></button>
                  <button type="button" className={btn.icon} aria-label={`Delete ${occasion.name}`} onClick={() => setDeleting(occasion)}><Trash2 size={15} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <OccasionDialog occasion={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteOccasionDialog occasion={deleting} onClose={() => setDeleting(null)} />}
    </Card>
  )
}

function OccasionDialog({ occasion, onClose }: { occasion: AdminGiftOccasion | null; onClose: () => void }) {
  const [create, createState] = useCreateGiftOccasionMutation()
  const [update, updateState] = useUpdateGiftOccasionMutation()
  const [uploadImage, uploadState] = useUploadGiftOccasionImageMutation()
  const [name, setName] = useState(occasion?.name ?? '')
  const [slug, setSlug] = useState(occasion?.slug ?? '')
  const [tagline, setTagline] = useState(occasion?.tagline ?? '')
  const [sortOrder, setSortOrder] = useState(String(occasion?.sortOrder ?? 0))
  const [isActive, setIsActive] = useState(occasion?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(occasion?.isFeatured ?? false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(occasion?.imageUrl ?? null)
  const busy = createState.isLoading || updateState.isLoading || uploadState.isLoading
  const error = createState.error ?? updateState.error ?? uploadState.error

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const input = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      tagline: tagline.trim() || null,
      sortOrder: Math.max(0, Math.min(1000, Number(sortOrder) || 0)),
      isActive,
      isFeatured,
    }
    try {
      const saved = occasion ? await update({ id: occasion.id, ...input }).unwrap() : await create(input).unwrap()
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        await uploadImage({ id: saved.id, formData }).unwrap()
      }
      toast.success(occasion ? 'Occasion updated' : 'Occasion added')
      onClose()
    } catch {
      // Shown inline via `error`.
    }
  }

  return (
    <Dialog
      title={occasion ? `Edit ${occasion.name}` : 'Add occasion'}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="occasion-form" className={btn.primary} disabled={busy}>{busy && <Spinner />} Save</button>
        </>
      }
    >
      <form id="occasion-form" onSubmit={submit} className="grid gap-4">
        <TextField label="Name" required value={name} maxLength={60} onChange={setName} placeholder="Weddings" />
        <div>
          <label className={labelClass} htmlFor="occasion-slug">URL slug</label>
          <input id="occasion-slug" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="Generated from the name" className={input} />
          <p className="mt-1 text-[11px] text-stone-500">Used in links like #gifts?occasion=weddings</p>
        </div>
        <TextField label="Tagline" value={tagline} maxLength={200} onChange={setTagline} hint="Shown on the “Shop by Occasion” card" />
        <div>
          <label className={labelClass} htmlFor="occasion-order">Display order</label>
          <input id="occasion-order" type="number" min={0} max={1000} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={input} />
        </div>
        <Switch checked={isActive} onChange={setIsActive} label="Visible on the page" />
        <Switch checked={isFeatured} onChange={setIsFeatured} label="Show as a “Shop by Occasion” card" hint="Cards look best with an image." />
        <ImageSlot
          label="Card image"
          url={preview}
          fallbackNote="No image — the card shows a green gradient."
          busy={false}
          onUpload={(selected) => {
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
          }}
          onRemove={() => {
            setFile(null)
            setPreview(occasion?.imageUrl ?? null)
          }}
        />
        <InlineError error={error} />
      </form>
    </Dialog>
  )
}

function DeleteOccasionDialog({ occasion, onClose }: { occasion: AdminGiftOccasion; onClose: () => void }) {
  const [remove, { isLoading, error }] = useDeleteGiftOccasionMutation()
  return (
    <Dialog
      title={`Delete ${occasion.name}?`}
      tone="danger"
      onClose={onClose}
      busy={isLoading}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={isLoading}>Keep it</button>
          <button
            type="button"
            className={btn.danger}
            disabled={isLoading}
            onClick={async () => {
              try {
                await remove(occasion.id).unwrap()
                toast.success(`${occasion.name} deleted`)
                onClose()
              } catch {
                // Shown inline.
              }
            }}
          >
            {isLoading && <Spinner />} Delete occasion
          </button>
        </>
      }
    >
      <p className="text-sm text-stone-600 dark:text-stone-300">
        The {occasion.productCount} linked {occasion.productCount === 1 ? 'product stays' : 'products stay'} in your catalogue but {occasion.productCount === 1 ? 'is' : 'are'} no longer listed under this occasion. To hide it temporarily, switch off “Visible” instead.
      </p>
      <div className="mt-3"><InlineError error={error} /></div>
    </Dialog>
  )
}
