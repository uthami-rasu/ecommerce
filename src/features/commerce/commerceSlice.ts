import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type CartLine = { productId: string; quantity: number; weight: string }

type CommerceState = {
  cart: CartLine[]
  wishlist: string[]
  lastOrderId: string | null
  lastOrder: CartLine[]
}

const initialState: CommerceState = { cart: [], wishlist: [], lastOrderId: null, lastOrder: [] }

const commerceSlice = createSlice({
  name: 'commerce',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartLine>) => {
      const line = state.cart.find((item) => item.productId === action.payload.productId && item.weight === action.payload.weight)
      if (line) line.quantity += action.payload.quantity
      else state.cart.push(action.payload)
    },
    setCartQuantity: (state, action: PayloadAction<{ productId: string; weight: string; quantity: number }>) => {
      const line = state.cart.find((item) => item.productId === action.payload.productId && item.weight === action.payload.weight)
      if (line) line.quantity = Math.max(1, action.payload.quantity)
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; weight: string }>) => {
      state.cart = state.cart.filter((item) => item.productId !== action.payload.productId || item.weight !== action.payload.weight)
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.includes(action.payload) ? state.wishlist.filter((id) => id !== action.payload) : [...state.wishlist, action.payload]
    },
    placeOrder: (state) => {
      state.lastOrderId = `BSC-${Date.now().toString().slice(-8)}`
      state.lastOrder = [...state.cart]
      state.cart = []
    },
  },
})

export const { addToCart, setCartQuantity, removeFromCart, toggleWishlist, placeOrder } = commerceSlice.actions
export default commerceSlice.reducer
