/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface Window {
  /** Active Lenis smooth-scroll instance, set by `useLenis`. */
  lenis?: import('lenis').default | null
}
