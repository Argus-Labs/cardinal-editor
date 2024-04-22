import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import {
  routeMsgAuthorizePersonaAddress,
  routeMsgCreatePersona,
  routeQryPersonaSigner,
  routeQryReceiptsList,
  worldQueryOptions,
} from '@/lib/query-options'

import { SidebarMessages } from './messages'
import { CreatePersona } from './persona'
import { SidebarQueries } from './queries'

const builtinMessages = new Set([routeMsgCreatePersona, routeMsgAuthorizePersonaAddress])
const builtinQueries = new Set([routeQryPersonaSigner, routeQryReceiptsList])

export function Sidebar() {
  const cardinal = useCardinal()
  const { data, isError, error } = useQuery(worldQueryOptions(cardinal))
  const { toast } = useToast()

  useEffect(() => {
    if (isError)
      toast({
        title: 'Failed to fetch entities',
        description: error.message,
        variant: 'destructive',
      })
  }, [isError, error, toast])

  const messages = data?.messages.filter((m) => !builtinMessages.has(m.url)) ?? []
  const queries = data?.queries.filter((q) => !builtinQueries.has(q.url)) ?? []
  const { namespace } = data!

  return (
    <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 w-64 overflow-y-auto border-r text-sm">
      <div className="space-y-2">
        <CreatePersona namespace={namespace} />
        <SidebarMessages messages={messages} namespace={namespace} />
        <SidebarQueries queries={queries} />
      </div>
      <ThemeToggle className="self-end" />
    </aside>
  )
}
