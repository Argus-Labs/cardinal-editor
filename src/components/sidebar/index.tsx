import { useQuery } from '@tanstack/react-query'

import { ThemeToggle } from '@/components/theme-toggle'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'

import { SidebarMessages } from './messages'
import { CreatePersona } from './persona'
import { SidebarQueries } from './queries'

const builtinMessages = new Set([
  '/tx/persona/create-persona',
  '/tx/game/authorize-persona-address',
])
const builtinQueries = new Set([
  '/query/persona/signer',
  '/query/debug/state',
  '/query/receipts/list',
])

export function Sidebar() {
  const cardinal = useCardinal()
  const { data } = useQuery(worldQueryOptions(cardinal))

  const messages = data?.messages.filter((m) => !builtinMessages.has(m.url)) ?? []
  const queries = data?.queries.filter((q) => !builtinQueries.has(q.url)) ?? []

  return (
    <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 overflow-y-auto border-r text-sm">
      <div className="space-y-2">
        <CreatePersona />
        <SidebarMessages messages={messages} />
        <SidebarQueries queries={queries} />
      </div>
      <ThemeToggle className="self-end" />
    </aside>
  )
}
