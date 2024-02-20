import React, { Suspense } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import logo from '@/assets/world.svg'
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

// TODO: autofill from cardinal, will probably need custom components for queries & messages
const sidebarNav = [
  {
    title: 'Queries',
    items: []
  },
  {
    title: 'Messages',
    items: []
  },
]

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="border-b">
        <nav className="flex items-center justify-between px-3 h-12">
          <Link to="/">
            <img src={logo} width={32} height={32} />
          </Link>
          {/* TODO: connect with running cardinal instance */}
          <div className="flex items-center gap-2">
            <label htmlFor="host" className="flex-shrink-0 text-xs text-muted-foreground">Cardinal URL</label>
            <Input id="host" placeholder="localhost:3333" value="localhost:3333" className="h-8" />
            <div className="size-2 rounded-full bg-green-500 flex-shrink-0" />
          </div>
        </nav>
      </header>
      <main className="flex min-h-[calc(100%-3rem-1px)]">
        <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 border-r text-sm">
          <div>
            {sidebarNav.map((item) => (
              <p className="font-bold px-2 py-1">{item.title}</p>
            ))}
          </div>
          <ThemeToggle className="self-end" />
        </aside>
        <div className="bg-muted w-full px-4 pt-4 pb-2">
          <Outlet />
        </div>
      </main>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
})
