import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Max units per line, mirrors the API's MAX_LINE_QUANTITY. */
export const MAX_LINE_QUANTITY = 20

/** Browser-only cart for signed-out shoppers; merged into the account cart on sign-in. */
export type GuestCartLine = {
  variantId: string
  quantity: number
  productId: string
  slug: string
  name: string
  variantLabel: string
  imageUrl: string | null
  unitPrice: number
  compareAtPrice: number | null
}

const STORAGE_KEY = 'bossco.guestCart'

export const loadGuestCart = (): GuestCartLine[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((line) => line?.variantId && line.quantity > 0) : []
  } catch {
    return []
  }
}

export const persistGuestCart = (lines: GuestCartLine[]) => {
  try {
    if (lines.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: the cart still works for this page view.
  }
}

const clamp = (quantity: number) => Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)))

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState: { lines: loadGuestCart() },
  reducers: {
    guestItemAdded: (state, action: PayloadAction<GuestCartLine>) => {
      const line = state.lines.find((item) => item.variantId === action.payload.variantId)
      if (line) line.quantity = clamp(line.quantity + action.payload.quantity)
      else state.lines.push({ ...action.payload, quantity: clamp(action.payload.quantity) })
    },
    guestQuantitySet: (state, action: PayloadAction<{ variantId: string; quantity: number }>) => {
      const line = state.lines.find((item) => item.variantId === action.payload.variantId)
      if (line) line.quantity = clamp(action.payload.quantity)
    },
    guestItemRemoved: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((item) => item.variantId !== action.payload)
    },
    guestCartCleared: (state) => {
      state.lines = []
    },
  },
})

export const { guestItemAdded, guestQuantitySet, guestItemRemoved, guestCartCleared } = guestCartSlice.actions
export default guestCartSlice.reducer
