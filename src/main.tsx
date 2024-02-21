import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { ThemeProvider } from '@/lib/theme-provider'
import { routeTree } from './routeTree.gen'
import './index.css'
import { CardinalProvider } from './lib/cardinal-provider'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <CardinalProvider>
          <RouterProvider router={router} />
        </CardinalProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
