import type { OrderTracking, TrackingInput } from '../../types/api'
import { endOfDayIso, fromDateInput, toDateInput, todayInput } from './dates'

export type TrackingDraft = { carrier: string; trackingNumber: string; trackingUrl: string; eta: string }

export const emptyTrackingDraft: TrackingDraft = { carrier: '', trackingNumber: '', trackingUrl: '', eta: '' }

export const CARRIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'Ekart', 'India Post', 'Xpressbees', 'Shadowfax']

/** Client-side checks mirroring the API (it validates again). */
export function trackingErrors(draft: TrackingDraft) {
  const errors: Partial<Record<keyof TrackingDraft, string>> = {}
  if (draft.trackingUrl.trim() && !/^https?:\/\/\S+\.\S+/i.test(draft.trackingUrl.trim())) errors.trackingUrl = 'Enter a full link starting with https://'
  if (draft.eta) {
    if (!fromDateInput(draft.eta)) errors.eta = 'Pick a valid date'
    else if (draft.eta < todayInput()) errors.eta = 'Expected delivery can’t be in the past'
  }
  return errors
}

/** Draft pre-filled from what the order already has (past ETAs are dropped so they can't block saving). */
export function draftFromTracking(tracking: OrderTracking | undefined | null): TrackingDraft {
  const eta = tracking?.estimatedDeliveryAt ? toDateInput(new Date(tracking.estimatedDeliveryAt)) : ''
  return {
    carrier: tracking?.carrier ?? '',
    trackingNumber: tracking?.trackingNumber ?? '',
    trackingUrl: tracking?.trackingUrl ?? '',
    eta: eta && eta >= todayInput() ? eta : '',
  }
}

/** Fields that are filled in, as API input (ETA = end of the chosen local day). */
export function trackingInput(draft: TrackingDraft): TrackingInput {
  const out: TrackingInput = {}
  if (draft.carrier.trim()) out.carrier = draft.carrier.trim()
  if (draft.trackingNumber.trim()) out.trackingNumber = draft.trackingNumber.trim()
  if (draft.trackingUrl.trim()) out.trackingUrl = draft.trackingUrl.trim()
  const eta = fromDateInput(draft.eta)
  if (eta) out.estimatedDeliveryAt = endOfDayIso(eta)
  return out
}

type TrackingField = 'carrier' | 'trackingNumber' | 'trackingUrl' | 'estimatedDeliveryAt'

/** PATCH body: omitted = unchanged, `null` = clear the stored value (supported by the API). */
export type TrackingPatch = Partial<Record<TrackingField, string | null>>

/** Only what changed compared with the stored tracking; emptied fields are sent as null. */
export function trackingChanges(draft: TrackingDraft, current: OrderTracking | undefined | null): TrackingPatch {
  const next = trackingInput(draft)
  const initial = draftFromTracking(current)
  const changes: TrackingPatch = {}
  if (draft.carrier.trim() !== initial.carrier) changes.carrier = next.carrier ?? null
  if (draft.trackingNumber.trim() !== initial.trackingNumber) changes.trackingNumber = next.trackingNumber ?? null
  if (draft.trackingUrl.trim() !== initial.trackingUrl) changes.trackingUrl = next.trackingUrl ?? null
  if (draft.eta !== initial.eta) changes.estimatedDeliveryAt = next.estimatedDeliveryAt ?? null
  return changes
}
