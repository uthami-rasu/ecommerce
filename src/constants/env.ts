/** API base URL, e.g. https://api.example.com/api/v1 (set VITE_API_URL at build time). */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '')
