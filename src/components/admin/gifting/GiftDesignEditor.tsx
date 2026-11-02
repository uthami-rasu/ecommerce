import { ExternalLink, Save } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useGetAdminProductQuery, useGetAdminProductsQuery } from '../../../features/admin/adminApi'
import {
  useGetAdminGiftDesignQuery,
  useRemoveGiftDesignImageMutation,
  useUpdateAdminGiftDesignMutation,
  useUploadGiftDesignImageMutation,
} from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { GiftDesign, GiftDesignInput, GiftPoint } from '../../../types/api'
import { formatMoney } from '../../../utils/format'
import { btn, input, label as labelClass } from '../styles'
import { Card, CardHeader, ErrorState, InlineError, Skeleton, Spinner } from '../ui'
import { IconSelect, ImageSlot, ListEditor, TextField } from './fields'
import { GiftProductPanel } from './GiftProductPanel'

const THEME_NAMES = ['light background, photo left', 'wine background, photo right', 'dark background, centred']

/** Image URLs are owned by the upload endpoints and never sent with text edits. */
const toInput = (design: GiftDesign): GiftDesignInput => ({
  hero: {
    eyebrow: design.hero.eyebrow,
    title: design.hero.title,
    subtitle: design.hero.subtitle,
    callLabel: design.hero.callLabel,
    phone: design.hero.phone,
    whatsappLabel: design.hero.whatsappLabel,
    whatsappNumber: design.hero.whatsappNumber,
    whatsappMessage: design.hero.whatsappMessage,
  },
  intro: { title: design.intro.title, points: design.intro.points },
  collections: design.collections.map(({ title, description, ctaLabel, productId }) => ({ title, description, ctaLabel, productId })),
  moments: { title: design.moments.title, subtitle: design.moments.subtitle, items: design.moments.items.map(({ title, tagline }) => ({ title, tagline })) },
  pillars: design.pillars,
  journey: design.journey,
  cta: { title: design.cta.title, buttonLabel: design.cta.buttonLabel },
})

export function GiftDesignEditor() {
  const { data, isLoading, error, refetch } = useGetAdminGiftDesignQuery()
  if (isLoading) return <Card className="p-6"><Skeleton className="h-64" /></Card>
  if (!data) return <Card><ErrorState error={error} onRetry={refetch} /></Card>
  // Keyed on the text only, so uploading a photo never resets unsaved text edits.
  return <DesignForm key={JSON.stringify(toInput(data))} saved={data} />
}

function DesignForm({ saved }: { saved: GiftDesign }) {
  const [draft, setDraft] = useState<GiftDesignInput>(() => toInput(saved))
  const [update, { isLoading: saving, error }] = useUpdateAdminGiftDesignMutation()
  const [upload] = useUploadGiftDesignImageMutation()
  const [remove] = useRemoveGiftDesignImageMutation()
  const [busySlot, setBusySlot] = useState<string | null>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(saved))

  const changeImage = async (slot: string, file: File | null) => {
    setBusySlot(slot)
    try {
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        await upload({ slot, formData }).unwrap()
        toast.success('Photo updated')
      } else {
        await remove(slot).unwrap()
        toast.success('Photo removed — the default photo is shown again')
      }
    } catch (err) {
      toast.error('Photo not saved', { description: errorMessage(err) })
    } finally {
      setBusySlot(null)
    }
  }
  const image = (slot: string, title: string, url: string | null) => (
    <ImageSlot
      label={title}
      url={url}
      fallbackNote="Showing the default photo from the design."
      busy={busySlot === slot}
      onUpload={(file) => void changeImage(slot, file)}
      onRemove={() => void changeImage(slot, null)}
    />
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await update(draft).unwrap()
      toast.success('Gift page updated', { description: 'Changes are live on the storefront.' })
    } catch (err) {
      toast.error('Not saved', { description: errorMessage(err) })
    }
  }

  const setHero = (patch: Partial<GiftDesignInput['hero']>) => setDraft((d) => ({ ...d, hero: { ...d.hero, ...patch } }))
  const setCollection = (index: number, patch: Partial<GiftDesignInput['collections'][number]>) =>
    setDraft((d) => ({ ...d, collections: d.collections.map((c, i) => (i === index ? { ...c, ...patch } : c)) }))
  const setMoment = (index: number, patch: Partial<GiftDesignInput['moments']['items'][number]>) =>
    setDraft((d) => ({ ...d, moments: { ...d.moments, items: d.moments.items.map((m, i) => (i === index ? { ...m, ...patch } : m)) } }))

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Section title="1. Hero banner">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Eyebrow" value={draft.hero.eyebrow} maxLength={60} onChange={(eyebrow) => setHero({ eyebrow })} />
          <TextField label="Title" required value={draft.hero.title} maxLength={120} onChange={(title) => setHero({ title })} />
          <div className="sm:col-span-2"><TextField label="Subtitle" multiline value={draft.hero.subtitle} maxLength={400} onChange={(subtitle) => setHero({ subtitle })} /></div>
          <TextField label="Call button label" required value={draft.hero.callLabel} maxLength={30} onChange={(callLabel) => setHero({ callLabel })} />
          <TextField label="Phone number" type="tel" required value={draft.hero.phone} maxLength={20} onChange={(phone) => setHero({ phone })} />
          <TextField label="WhatsApp button label" required value={draft.hero.whatsappLabel} maxLength={30} onChange={(whatsappLabel) => setHero({ whatsappLabel })} />
          <TextField label="WhatsApp number" required value={draft.hero.whatsappNumber} maxLength={15} onChange={(value) => setHero({ whatsappNumber: value.replace(/\D/g, '') })} hint="Digits with country code, e.g. 918807783007" />
          <div className="sm:col-span-2"><TextField label="WhatsApp pre-filled message" value={draft.hero.whatsappMessage} maxLength={300} onChange={(whatsappMessage) => setHero({ whatsappMessage })} /></div>
          <div className="sm:col-span-2">{image('hero', 'Background photo', saved.hero.imageUrl)}</div>
        </div>
      </Section>

      <Section title="2. The Art of Thoughtful Gifting">
        <TextField label="Title" required value={draft.intro.title} maxLength={120} onChange={(title) => setDraft((d) => ({ ...d, intro: { ...d.intro, title } }))} />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {image('intro', 'Main photo', saved.intro.imageUrl)}
          {image('introAccent', 'Small overlapping photo', saved.intro.accentImageUrl)}
        </div>
        <div className="mt-4">
          <ListEditor
            items={draft.intro.points}
            max={4}
            addLabel="Add point"
            onChange={(points) => setDraft((d) => ({ ...d, intro: { ...d.intro, points } }))}
            create={(): GiftPoint => ({ title: '', body: '', icon: 'gift' })}
            render={(point, patch) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr_200px]">
                <TextField label="Heading" required value={point.title} maxLength={60} onChange={(title) => patch({ title })} />
                <TextField label="Text" value={point.body} maxLength={300} onChange={(body) => patch({ body })} />
                <IconSelect value={point.icon} onChange={(icon) => patch({ icon })} />
              </div>
            )}
          />
        </div>
      </Section>

      {draft.collections.map((collection, index) => (
        <Section key={index} title={`${index + 3}. Collection ${index + 1}`} description={`Shown on a ${THEME_NAMES[index]}. Pick or create the product this gift sells, then set its price and stock below.`}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Name" required value={collection.title} maxLength={80} onChange={(title) => setCollection(index, { title })} />
            <TextField label="Button label" required value={collection.ctaLabel} maxLength={30} onChange={(ctaLabel) => setCollection(index, { ctaLabel })} />
            <div className="md:col-span-2"><TextField label="Description" multiline value={collection.description} maxLength={400} onChange={(description) => setCollection(index, { description })} /></div>
            <div className="md:col-span-2"><ProductPicker value={collection.productId} onChange={(productId) => setCollection(index, { productId })} /></div>
            <div className="md:col-span-2">
              <GiftProductPanel
                productId={collection.productId}
                collectionTitle={collection.title}
                onCreated={async (productId) => {
                  // Link and save straight away so the new product is never left unlinked.
                  const next = { ...draft, collections: draft.collections.map((c, i) => (i === index ? { ...c, productId } : c)) }
                  setDraft(next)
                  await update(next).unwrap()
                }}
              />
            </div>
            <div className="md:col-span-2">{image(`collection-${index}`, 'Photo', saved.collections[index]?.imageUrl ?? null)}</div>
          </div>
        </Section>
      ))}

      <Section title="6. Celebrated Across Moments">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" required value={draft.moments.title} maxLength={120} onChange={(title) => setDraft((d) => ({ ...d, moments: { ...d.moments, title } }))} />
          <TextField label="Text beside the title" value={draft.moments.subtitle} maxLength={300} onChange={(subtitle) => setDraft((d) => ({ ...d, moments: { ...d.moments, subtitle } }))} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {draft.moments.items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80 dark:bg-stone-950/40 dark:ring-stone-800">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Card {index + 1}{index < 2 ? ' (tall)' : ''}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Title" required value={item.title} maxLength={40} onChange={(title) => setMoment(index, { title })} />
                <TextField label="Tagline" value={item.tagline} maxLength={60} onChange={(tagline) => setMoment(index, { tagline })} />
              </div>
              {image(`moment-${index}`, 'Photo', saved.moments.items[index]?.imageUrl ?? null)}
            </div>
          ))}
        </div>
      </Section>

      <Section title="7. Green band — four promises">
        <div className="grid gap-4 lg:grid-cols-2">
          {draft.pillars.items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80 dark:bg-stone-950/40 dark:ring-stone-800">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{String(index + 1).padStart(2, '0')}.</p>
              <TextField label="Heading" required value={item.title} maxLength={60} onChange={(title) => setDraft((d) => ({ ...d, pillars: { items: d.pillars.items.map((p, i) => (i === index ? { ...p, title } : p)) } }))} />
              <TextField label="Text" multiline value={item.body} maxLength={300} onChange={(body) => setDraft((d) => ({ ...d, pillars: { items: d.pillars.items.map((p, i) => (i === index ? { ...p, body } : p)) } }))} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="8. The Journey of Your Gift">
        <TextField label="Title" required value={draft.journey.title} maxLength={120} onChange={(title) => setDraft((d) => ({ ...d, journey: { ...d.journey, title } }))} />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {draft.journey.steps.map((step, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80 dark:bg-stone-950/40 dark:ring-stone-800">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Step {index + 1}</p>
              <TextField label="Heading" required value={step.title} maxLength={60} onChange={(title) => setDraft((d) => ({ ...d, journey: { ...d.journey, steps: d.journey.steps.map((s, i) => (i === index ? { ...s, title } : s)) } }))} />
              <TextField label="Text" value={step.body} maxLength={300} onChange={(body) => setDraft((d) => ({ ...d, journey: { ...d.journey, steps: d.journey.steps.map((s, i) => (i === index ? { ...s, body } : s)) } }))} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="9. Closing banner" description="The button opens WhatsApp with the number from the hero section.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" required value={draft.cta.title} maxLength={120} onChange={(title) => setDraft((d) => ({ ...d, cta: { ...d.cta, title } }))} />
          <TextField label="Button label" required value={draft.cta.buttonLabel} maxLength={30} onChange={(buttonLabel) => setDraft((d) => ({ ...d, cta: { ...d.cta, buttonLabel } }))} />
          <div className="md:col-span-2">{image('cta', 'Background photo', saved.cta.imageUrl)}</div>
        </div>
      </Section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-stone-200 backdrop-blur dark:bg-stone-900/95 dark:ring-stone-800">
        <div className="min-w-0 flex-1">{error ? <InlineError error={error} /> : <p className="px-2 text-xs text-stone-500">{dirty ? 'You have unsaved changes. Photos save on their own.' : 'All changes saved.'}</p>}</div>
        <div className="flex gap-2">
          <a href="#gifts" target="_blank" rel="noopener" className={btn.secondary}><ExternalLink size={15} /> View page</a>
          <button type="button" className={btn.ghost} disabled={!dirty || saving} onClick={() => setDraft(toInput(saved))}>Discard</button>
          <button type="submit" className={btn.primary} disabled={!dirty || saving}>{saving ? <Spinner /> : <Save size={15} />} Save changes</button>
        </div>
      </div>
    </form>
  )
}

/** Picks the product a collection's button adds to the cart (searches the whole catalogue). */
function ProductPicker({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const id = useId()
  const [search, setSearch] = useState('')
  const { data, isFetching } = useGetAdminProductsQuery({ search: search.trim() || undefined, limit: 50, sort: 'name' })
  const options = data?.data ?? []
  const selected = useGetAdminProductQuery(value ?? '', { skip: !value }).data
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={labelClass}>Product added to the cart *</label>
      <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" aria-label="Search products" className={input} />
        <select id={id} value={value ?? ''} onChange={(event) => onChange(event.target.value || null)} className={input}>
          <option value="">— No product (button hidden) —</option>
          {selected && !options.some((option) => option.id === selected.id) && <option value={selected.id}>{selected.name}</option>}
          {options.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · from {formatMoney(product.price)}{product.isActive ? '' : ' (hidden in store)'}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11px] text-stone-500">{isFetching ? 'Searching…' : 'Create the gift product (with its photo, sizes and prices) under Products first, then pick it here.'}</p>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="p-5">{children}</div>
    </Card>
  )
}
