import { ExternalLink, Save } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  useGetAdminGiftDesignQuery,
  useUpdateAdminGiftDesignMutation,
} from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { GiftDesign, GiftDesignInput, GiftPoint } from '../../../types/api'
import { btn } from '../styles'
import { Card, CardHeader, ErrorState, InlineError, Skeleton, Spinner } from '../ui'
import { IconSelect, ListEditor, TextField } from './fields'
import { IncludedProductsField } from './GiftProductPanel'

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
  collections: design.collections.map(({ title, description, ctaLabel, price, compareAtPrice, stock, includeIds }) => ({ title, description, ctaLabel, price, compareAtPrice, stock, includeIds })),
  moments: { title: design.moments.title, subtitle: design.moments.subtitle, items: design.moments.items.map(({ title, tagline }) => ({ title, tagline })) },
  pillars: design.pillars,
  journey: design.journey,
  cta: { title: design.cta.title, buttonLabel: design.cta.buttonLabel },
})

export function GiftDesignEditor() {
  const { data, isLoading, error, refetch } = useGetAdminGiftDesignQuery()
  if (isLoading) return <Card className="p-6"><Skeleton className="h-64" /></Card>
  if (!data) return <Card><ErrorState error={error} onRetry={refetch} /></Card>
  // Re-seeded from the server after each save.
  return <DesignForm key={JSON.stringify(toInput(data))} saved={data} />
}

function DesignForm({ saved }: { saved: GiftDesign }) {
  const [draft, setDraft] = useState<GiftDesignInput>(() => toInput(saved))
  const [update, { isLoading: saving, error }] = useUpdateAdminGiftDesignMutation()
  const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(saved))

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
        </div>
      </Section>

      <Section title="2. The Art of Thoughtful Gifting">
        <TextField label="Title" required value={draft.intro.title} maxLength={120} onChange={(title) => setDraft((d) => ({ ...d, intro: { ...d.intro, title } }))} />
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
        <Section key={index} title={`${index + 3}. Collection ${index + 1}`} description={`Shown on a ${THEME_NAMES[index]}. Enter the gift's own price and stock. Adding products is optional — they're only listed as “Includes …”.`}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Name" required value={collection.title} maxLength={80} onChange={(title) => setCollection(index, { title })} />
            <TextField label="Button label" required value={collection.ctaLabel} maxLength={30} onChange={(ctaLabel) => setCollection(index, { ctaLabel })} />
            <div className="md:col-span-2"><TextField label="Description" multiline value={collection.description} maxLength={400} onChange={(description) => setCollection(index, { description })} /></div>
            <div className="md:col-span-2">
              <GiftPriceFields
                price={collection.price}
                compareAtPrice={collection.compareAtPrice}
                stock={collection.stock}
                onChange={(patch) => setCollection(index, patch)}
              />
            </div>
            <div className="md:col-span-2">
              <IncludedProductsField productIds={collection.includeIds} onChange={(includeIds) => setCollection(index, { includeIds })} />
            </div>
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
        </div>
      </Section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-stone-200 backdrop-blur dark:bg-stone-900/95 dark:ring-stone-800">
        <div className="min-w-0 flex-1">{error ? <InlineError error={error} /> : <p className="px-2 text-xs text-stone-500">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>}</div>
        <div className="flex gap-2">
          <a href="#gifts" target="_blank" rel="noopener" className={btn.secondary}><ExternalLink size={15} /> View page</a>
          <button type="button" className={btn.ghost} disabled={!dirty || saving} onClick={() => setDraft(toInput(saved))}>Discard</button>
          <button type="submit" className={btn.primary} disabled={!dirty || saving}>{saving ? <Spinner /> : <Save size={15} />} Save changes</button>
        </div>
      </div>
    </form>
  )
}

/** The gift's own price: customers buy the gift itself at this price. Empty price = not for sale yet. */
function GiftPriceFields({ price, compareAtPrice, stock, onChange }: {
  price: number | null
  compareAtPrice: number | null
  stock: number
  onChange: (patch: { price?: number | null; compareAtPrice?: number | null; stock?: number }) => void
}) {
  const num = (value: string) => (value.trim() === '' ? null : Number(value))
  const field = 'w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-stone-900 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-[#173f32]/60 dark:bg-stone-950 dark:text-stone-100 dark:ring-stone-700'
  const off = price && compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0
  return (
    <div className="grid gap-3 rounded-2xl bg-[#f6f1e8] p-4 dark:bg-stone-950/40">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Gift price</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">Price (₹) *</span>
          <input type="number" min={1} step="0.01" inputMode="decimal" value={price ?? ''} placeholder="e.g. 1499" onChange={(event) => onChange({ price: num(event.target.value) })} className={field} />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">MRP (₹)</span>
          <input type="number" min={1} step="0.01" inputMode="decimal" value={compareAtPrice ?? ''} placeholder="Optional" onChange={(event) => onChange({ compareAtPrice: num(event.target.value) })} className={field} />
          {off > 0 && <span className="mt-0.5 block text-[11px] font-semibold text-emerald-600">{off}% off</span>}
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">Stock *</span>
          <input type="number" min={0} step="1" inputMode="numeric" value={stock} onChange={(event) => onChange({ stock: Math.max(0, Math.trunc(Number(event.target.value) || 0)) })} className={field} />
        </label>
      </div>
      <p className="text-[11px] text-stone-500">{price ? 'Customers can add this gift to the cart at this price.' : 'Leave the price empty to hide the Add to cart button.'}</p>
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
