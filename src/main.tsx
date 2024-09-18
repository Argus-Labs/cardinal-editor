import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { PostHogProvider } from 'posthog-js/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { CardinalProvider } from '@/lib/cardinal-provider'
import { ThemeProvider } from '@/lib/theme-provider'

import './index.css'
import { routeTree } from './routeTree.gen'

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

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN as string,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
    Sentry.tanstackRouterBrowserTracingIntegration(router),
    Sentry.feedbackIntegration({ colorScheme: 'system', autoInject: false }),
  ],
  release: 'cardinal-editor@v0.5.0',

  /// Tracing
  //  Capture 100% of the transactions
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost'],

  /// Session Replay
  // This sets the sample rate at 10%. You may want to change it to 100% while in development
  // and then sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,
  // If you're not already sampling the entire session, change the sample rate to 100% when
  // sampling sessions where errors occur.
  replaysOnErrorSampleRate: 1.0,

  profilesSampleRate: 1.0,
})

const postHogConfig = {
  apiKey: import.meta.env.VITE_POSTHOG_KEY as string,
  options: {
    person_profiles: 'identified_only',
    capture_pageview: false,
  },
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PostHogProvider apiKey={postHogConfig.apiKey} options={postHogConfig.options}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <QueryClientProvider client={queryClient}>
            <CardinalProvider>
              <RouterProvider router={router} />
            </CardinalProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </PostHogProvider>
    </StrictMode>,
  )
}
