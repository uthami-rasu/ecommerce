import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import themeReducer from '../features/theme/themeSlice'
import authReducer, { bootstrapSession, sessionEnded } from '../features/auth/authSlice'
import guestCartReducer, { persistGuestCart } from '../features/cart/guestCartSlice'
import { setSessionExpiredHandler } from '../lib/http/apiClient'
import { sessionStore } from '../lib/http/session'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    guestCart: guestCartReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Persist the guest cart whenever it changes.
let lastGuestLines = store.getState().guestCart.lines
store.subscribe(() => {
  const lines = store.getState().guestCart.lines
  if (lines !== lastGuestLines) {
    lastGuestLines = lines
    persistGuestCart(lines)
  }
})

const endSession = () => {
  store.dispatch(sessionEnded())
  store.dispatch(api.util.resetApiState())
}
setSessionExpiredHandler(endSession)

// Another tab signed in or out.
sessionStore.subscribeExternal((session) => {
  const { status } = store.getState().auth
  if (!session && status === 'authenticated') endSession()
  if (session && status !== 'authenticated') store.dispatch(bootstrapSession())
})

store.dispatch(bootstrapSession())
