import { useQuery } from '@tanstack/react-query'

import { ThemeToggle } from '@/components/theme-toggle'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'

import { SidebarMessages } from './messages'
import { CreatePersona } from './persona'
import { SidebarQueries } from './queries'

export function Sidebar() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))

  const messages = data?.messages ?? []
  const queries = data?.queries ?? []

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
