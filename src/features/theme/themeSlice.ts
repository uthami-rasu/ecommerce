import { createSlice } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark'

/** Saved choice (written by `useTheme`); light by default. */
const savedTheme = (): Theme => {
  try {
    return localStorage.getItem('bossco-theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { value: savedTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.value = state.value === 'light' ? 'dark' : 'light'
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
