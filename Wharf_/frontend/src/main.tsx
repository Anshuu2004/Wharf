import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { analytics } from './lib/analytics/AnalyticsService'
import { PostHogProvider } from './lib/analytics/providers/posthogProvider'
import { GA4Provider } from './lib/analytics/providers/ga4Provider'

analytics.register(new PostHogProvider())
analytics.register(new GA4Provider())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
