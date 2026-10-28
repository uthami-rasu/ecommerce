import { ExternalLink, Save } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  useGetAdminGiftContentQuery,
  useRemoveGiftImageMutation,
  useUpdateAdminGiftContentMutation,
  useUploadGiftImageMutation,
} from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { GiftBudgetTier, GiftFeature, GiftImageSlot, GiftPageContent, GiftPageContentInput, GiftPoint } from '../../../types/api'
import { btn } from '../styles'
import { Card, CardHeader, ErrorState, InlineError, Skeleton, Spinner, Switch } from '../ui'
import { IconSelect, ImageSlot, ListEditor, PriceField, TextField } from './fields'

const withoutImage = <T extends { imageUrl: string | null }>(section: T): Omit<T, 'imageUrl'> => {
  const copy: Partial<T> = { ...section }
  delete copy.imageUrl
  return copy as Omit<T, 'imageUrl'>
}

/** Image URLs are owned by the upload endpoints and never sent with text edits. */
const toInput = (content: GiftPageContent): GiftPageContentInput => ({
  ...content,
  hero: withoutImage(content.hero),
  customize: withoutImage(content.customize),
  bulk: withoutImage(content.bulk),
})

export function GiftContentEditor() {
  const { data, isLoading, error, refetch } = useGetAdminGiftContentQuery()
  if (isLoading) return <Card className="p-6"><Skeleton className="h-64" /></Card>
  if (!data) return <Card><ErrorState error={error} onRetry={refetch} /></Card>
  // Keyed so a reload (e.g. after saving) re-seeds the form.
  return <ContentForm key={JSON.stringify(toInput(data))} saved={data} />
}

function ContentForm({ saved }: { saved: GiftPageContent }) {
  const [draft, setDraft] = useState<GiftPageContentInput>(() => toInput(saved))
  const [update, { isLoading: saving, error }] = useUpdateAdminGiftContentMutation()
  const [upload] = useUploadGiftImageMutation()
  const [remove] = useRemoveGiftImageMutation()
  const [imageBusy, setImageBusy] = useState<GiftImageSlot | null>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(saved))

  const set = <K extends keyof GiftPageContentInput>(section: K, patch: Partial<GiftPageContentInput[K]>) =>
    setDraft((current) => ({ ...current, [section]: { ...current[section], ...patch } }))

  // Images save on their own; unsaved text edits stay in the form (its key ignores image URLs).
  const changeImage = async (slot: GiftImageSlot, file: File | null) => {
    setImageBusy(slot)
    try {
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        await upload({ slot, formData }).unwrap()
        toast.success('Image updated')
      } else {
        await remove(slot).unwrap()
        toast.success('Image removed')
      }
    } catch (err) {
      toast.error('Image not saved', { description: errorMessage(err) })
    } finally {
      setImageBusy(null)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await update(draft).unwrap()
      toast.success('Return Gifts page updated', { description: 'Changes are live on the storefront.' })
    } catch (err) {
      toast.error('Not saved', { description: errorMessage(err) })
    }
  }

  const image = (slot: GiftImageSlot, label: string, fallbackNote: string) => (
    <ImageSlot
      label={label}
      url={saved[slot].imageUrl}
      fallbackNote={fallbackNote}
      busy={imageBusy === slot}
      onUpload={(file) => void changeImage(slot, file)}
      onRemove={() => void changeImage(slot, null)}
    />
  )

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Section title="Hero banner" description="The first thing visitors see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Eyebrow" value={draft.hero.eyebrow} maxLength={60} onChange={(eyebrow) => set('hero', { eyebrow })} hint="Small text above the title" />
          <TextField label="Title" required value={draft.hero.title} maxLength={120} onChange={(title) => set('hero', { title })} />
          <div className="sm:col-span-2">
            <TextField label="Subtitle" multiline value={draft.hero.subtitle} maxLength={400} onChange={(subtitle) => set('hero', { subtitle })} />
          </div>
          <TextField label="Call button label" required value={draft.hero.callLabel} maxLength={30} onChange={(callLabel) => set('hero', { callLabel })} />
          <TextField label="Phone number" type="tel" required value={draft.hero.phone} maxLength={20} onChange={(phone) => set('hero', { phone })} />
          <TextField label="WhatsApp button label" required value={draft.hero.whatsappLabel} maxLength={30} onChange={(whatsappLabel) => set('hero', { whatsappLabel })} />
          <TextField
            label="WhatsApp number"
            required
            value={draft.hero.whatsappNumber}
            maxLength={15}
            onChange={(whatsappNumber) => set('hero', { whatsappNumber: whatsappNumber.replace(/\D/g, '') })}
            hint="Digits only, with country code — e.g. 918807783007"
          />
          <div className="sm:col-span-2">
            <TextField label="WhatsApp pre-filled message" value={draft.hero.whatsappMessage} maxLength={300} onChange={(whatsappMessage) => set('hero', { whatsappMessage })} />
          </div>
          <div className="sm:col-span-2">{image('hero', 'Background image', 'Using the default dry-fruit photo.')}</div>
        </div>
      </Section>

      <Section title="Product listing" description="Products are chosen under the “Gift products” tab.">
        <TextField label="Section title" required value={draft.listing.title} maxLength={120} onChange={(title) => set('listing', { title })} />
      </Section>

      <Section title="Personalisation banner" enabled={draft.customize.enabled} onToggle={(enabled) => set('customize', { enabled })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title" required value={draft.customize.title} maxLength={120} onChange={(title) => set('customize', { title })} />
          <TextField label="Button label" required value={draft.customize.ctaLabel} maxLength={40} onChange={(ctaLabel) => set('customize', { ctaLabel })} hint="Opens the customisation request form" />
          <div className="sm:col-span-2">
            <TextField label="Text" multiline value={draft.customize.body} maxLength={500} onChange={(body) => set('customize', { body })} />
          </div>
          <TextField label="Note next to the button" value={draft.customize.note} maxLength={80} onChange={(note) => set('customize', { note })} />
          <div className="sm:col-span-2">{image('customize', 'Image', 'No image — the banner shows text only.')}</div>
        </div>
      </Section>

      <Section title="Shop by occasion" description="Cards for occasions marked “Show as card” on the Occasions tab." enabled={draft.occasions.enabled} onToggle={(enabled) => set('occasions', { enabled })}>
        <TextField label="Section title" required value={draft.occasions.title} maxLength={120} onChange={(title) => set('occasions', { title })} />
      </Section>

      <Section title="Gifts for every budget" description="Each tier filters the listing by price." enabled={draft.budget.enabled} onToggle={(enabled) => set('budget', { enabled })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title" required value={draft.budget.title} maxLength={120} onChange={(title) => set('budget', { title })} />
          <TextField label="Subtitle" value={draft.budget.subtitle} maxLength={200} onChange={(subtitle) => set('budget', { subtitle })} />
        </div>
        <div className="mt-4">
          <ListEditor
            items={draft.budget.tiers}
            max={6}
            addLabel="Add tier"
            onChange={(tiers) => set('budget', { tiers })}
            create={(): GiftBudgetTier => ({ label: '', title: '', minPrice: null, maxPrice: null, icon: 'tag' })}
            render={(tier, patch) => (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <TextField label="Label" value={tier.label} maxLength={40} onChange={(label) => patch({ label })} placeholder="Popular choice" />
                <TextField label="Title" required value={tier.title} maxLength={40} onChange={(title) => patch({ title })} placeholder="₹100 - ₹250" />
                <PriceField label="From (₹)" value={tier.minPrice} onChange={(minPrice) => patch({ minPrice })} />
                <PriceField label="Up to (₹)" value={tier.maxPrice} onChange={(maxPrice) => patch({ maxPrice })} />
                <IconSelect value={tier.icon} onChange={(icon) => patch({ icon })} />
              </div>
            )}
          />
        </div>
      </Section>

      <Section title="Bulk orders" enabled={draft.bulk.enabled} onToggle={(enabled) => set('bulk', { enabled })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title" required value={draft.bulk.title} maxLength={120} onChange={(title) => set('bulk', { title })} />
          <TextField label="Button label" required value={draft.bulk.ctaLabel} maxLength={40} onChange={(ctaLabel) => set('bulk', { ctaLabel })} hint="Opens the bulk quote request form" />
        </div>
        <div className="mt-4">
          <ListEditor
            items={draft.bulk.points}
            max={6}
            addLabel="Add point"
            onChange={(points) => set('bulk', { points })}
            create={(): GiftPoint => ({ title: '', body: '', icon: 'gift' })}
            render={(point, patch) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_200px]">
                <TextField label="Title" required value={point.title} maxLength={60} onChange={(title) => patch({ title })} />
                <TextField label="Text" value={point.body} maxLength={300} onChange={(body) => patch({ body })} />
                <IconSelect value={point.icon} onChange={(icon) => patch({ icon })} />
              </div>
            )}
          />
        </div>
        <div className="mt-4">{image('bulk', 'Image', 'Using the default warehouse photo.')}</div>
      </Section>

      <Section title="Feature strip" description="Small icons above the footer." enabled={draft.features.enabled} onToggle={(enabled) => set('features', { enabled })}>
        <ListEditor
          items={draft.features.items}
          max={8}
          addLabel="Add feature"
          onChange={(items) => set('features', { items })}
          create={(): GiftFeature => ({ title: '', subtitle: '', icon: 'star' })}
          render={(item, patch) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_200px]">
              <TextField label="Title" required value={item.title} maxLength={40} onChange={(title) => patch({ title })} />
              <TextField label="Subtitle" value={item.subtitle} maxLength={60} onChange={(subtitle) => patch({ subtitle })} />
              <IconSelect value={item.icon} onChange={(icon) => patch({ icon })} />
            </div>
          )}
        />
      </Section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-stone-200 backdrop-blur dark:bg-stone-900/95 dark:ring-stone-800">
        <div className="min-w-0 flex-1">{error ? <InlineError error={error} /> : <p className="px-2 text-xs text-stone-500">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>}</div>
        <div className="flex gap-2">
          <a href="#gifts" target="_blank" rel="noopener" className={btn.secondary}><ExternalLink size={15} /> View page</a>
          <button type="button" className={btn.ghost} disabled={!dirty || saving} onClick={() => setDraft(toInput(saved))}>Discard</button>
          <button type="submit" className={btn.primary} disabled={!dirty || saving}>
            {saving ? <Spinner /> : <Save size={15} />} Save changes
          </button>
        </div>
      </div>
    </form>
  )
}

function Section({ title, description, enabled, onToggle, children }: {
  title: string
  description?: string
  enabled?: boolean
  onToggle?: (enabled: boolean) => void
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        action={onToggle && <Switch checked={enabled ?? true} onChange={onToggle} label={enabled ? 'Shown' : 'Hidden'} />}
      />
      <div className={`p-5 ${enabled === false ? 'opacity-60' : ''}`}>{children}</div>
    </Card>
  )
}
