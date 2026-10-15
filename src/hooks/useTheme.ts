import { useEffect } from 'react'
import { useAppSelector } from '../app/hooks'

export function useTheme() {
  const theme = useAppSelector((state) => state.theme.value)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem('bossco-theme', theme)
    } catch {
      // Storage unavailable: the theme still applies for this visit.
    }
  }, [theme])

  return theme
}
