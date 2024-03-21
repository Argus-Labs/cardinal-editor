import { useQuery } from '@tanstack/react-query'

import { ThemeToggle } from '@/components/theme-toggle'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'

import { SidebarMessages } from './messages'
import { CreatePersona } from './persona'
import { SidebarQueries } from './queries'

// TODO: filter using url when world-915 is done
const builtin: { [key: string]: { [key: string]: boolean } } = {
  messages: {
    'create-persona': true,
    'authorize-persona-address': true,
  },
  queries: {
    signer: true,
    state: true,
    list: true,
  },
}

export function Sidebar() {
  const cardinal = useCardinal()
  const { data } = useQuery(worldQueryOptions(cardinal))

  const messages = data?.messages.filter((m) => !builtin.messages[m.name]) ?? []
  const queries = data?.queries.filter((q) => !builtin.queries[q.name]) ?? []

  return (
    <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 w-64 border-r text-sm">
      <div className="space-y-2">
        <CreatePersona />
        <SidebarMessages messages={messages} />
        <SidebarQueries queries={queries} />
      </div>
      <ThemeToggle className="self-end" />
    </aside>
  )
}
