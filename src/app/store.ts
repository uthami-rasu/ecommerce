import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '../features/theme/themeSlice'
import commerceReducer from '../features/commerce/commerceSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    commerce: commerceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
