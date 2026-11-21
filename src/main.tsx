import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import '@/styles/globals.css'
import { App } from '@/app/App'
import { startAuth } from '@/stores/authStore'

startAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
