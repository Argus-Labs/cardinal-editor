import * as Sentry from '@sentry/react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import posthog from 'posthog-js'

import { Header } from '@/components/header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createRootRoute({
  component: Root,
  beforeLoad: (route) => {
    posthog.capture('$pageview', { path: route.location.pathname })
  },
})

function Root() {
  return (
    <Sentry.ErrorBoundary fallback={Fallback}>
      <Header />
      <Outlet />
    </Sentry.ErrorBoundary>
  )
}

function Fallback() {
  return (
    <main className="flex justify-center pt-64 bg-muted min-h-screen">
      <div className="bg-background border border-border rounded-lg max-w-xl p-4 space-y-4 self-start">
        <h1 className="font-bold">An Unexpected Error Occured</h1>
        <hr className="border-border" />
        <p className="text-sm">Looks like we missed a bug, sorry about that!</p>
        <p className="text-sm">
          Most likely we've already been notified about this error, and are working to get a fix out
          as soon as possible. In the mean time, try restarting the Cardinal Editor to see if it
          helps.
        </p>
        <p className="text-sm">
          You can also ask for help in the{' '}
          <a
            href="https://t.me/worldengine_dev"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
            rel="noopener noreferrer"
          >
            World Engine Devs Telegram group
          </a>
          .
        </p>
      </div>
    </main>
  )
}
