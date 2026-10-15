import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../app/api'
import { sessionFromTokens, sessionStore } from '../../lib/http/session'
import { authRepository } from '../../repositories/authRepository'
import { cartRepository } from '../../repositories/cartRepository'
import type { AuthResponse, UserProfile } from '../../types/api'
import { guestCartCleared, type GuestCartLine } from '../cart/guestCartSlice'

type AuthStatus = 'unknown' | 'guest' | 'authenticated'

type AuthState = { status: AuthStatus; user: UserProfile | null }

const initialState: AuthState = { status: sessionStore.get() ? 'unknown' : 'guest', user: null }

type ThunkState = { guestCart: { lines: GuestCartLine[] } }

/** Restores the signed-in user from the persisted session on app start. */
export const bootstrapSession = createAsyncThunk('auth/bootstrap', async () => {
  if (!sessionStore.get()) return null
  try {
    return await authRepository.me()
  } catch {
    return null
  }
})

/**
 * Every successful sign-in (login, email verification, password reset, password change)
 * goes through here: persist tokens, then move the guest cart into the account.
 */
export const completeSignIn = createAsyncThunk('auth/completeSignIn', async (response: AuthResponse, { dispatch, getState }) => {
  sessionStore.set(sessionFromTokens(response))
  const guestLines = (getState() as ThunkState).guestCart.lines
  if (guestLines.length) {
    try {
      await cartRepository.merge(guestLines.map(({ variantId, quantity }) => ({ variantId, quantity })))
      dispatch(guestCartCleared())
    } catch {
      // Keep the guest cart if the merge fails; nothing is lost.
    }
  }
  dispatch(api.util.resetApiState())
  return response.user
})

export const signOut = createAsyncThunk('auth/signOut', async (_: void, { dispatch }) => {
  const session = sessionStore.get()
  sessionStore.set(null)
  dispatch(api.util.resetApiState())
  if (session) await authRepository.logout(session.refreshToken).catch(() => undefined)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userUpdated: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
    },
    /** The refresh token was rejected or another tab signed out. */
    sessionEnded: (state) => {
      state.status = 'guest'
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'guest'
      })
      .addCase(completeSignIn.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(signOut.pending, (state) => {
        state.user = null
        state.status = 'guest'
      })
  },
})

export const { userUpdated, sessionEnded } = authSlice.actions
export default authSlice.reducer
