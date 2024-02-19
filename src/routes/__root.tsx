import React, { Suspense } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import logo from '@/assets/logo.svg'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'

// Show dev tools only in development
// src: https://tanstack.com/router/latest/docs/framework/react/devtools
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="border">
        <nav className="flex items-center justify-between lg:container p-2">
          <Link to="/">
            <img src={logo} width={32} height={32} />
          </Link>
          {/* TODO: connect with running cardinal instance */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="size-2 rounded-full bg-green-500 flex-shrink-0" />
            <label htmlFor="host" className="flex-shrink-0 text-sm">Cardinal URL</label>
            <Input id="host" placeholder="localhost:3333" value="localhost:3333" />
          </div>
        </nav>
      </header>
      <main className="lg:container p-2">
        <Outlet />
      </main>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
})
