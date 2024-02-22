import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '@/lib/theme-provider'
import { CardinalProvider } from '@/lib/cardinal-provider'
import { ConfigProvider } from '@/lib/config-provider'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

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
        <QueryClientProvider client={queryClient}>
          <ConfigProvider>
            <CardinalProvider>
              <RouterProvider router={router} />
            </CardinalProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
