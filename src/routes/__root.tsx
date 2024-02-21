import React, { Suspense } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'

import { Layout } from '@/components/layout'

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
const sidebarItems = [
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
      <Layout sidebarItems={sidebarItems}>
        <Outlet />
      </Layout>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
})
