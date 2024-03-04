import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { BookDashed, MessageSquareCode, SearchCode } from 'lucide-react'
import { useState } from 'react'

import logo from '@/assets/world.svg'
import { BottomBar } from '@/components/bottom-bar'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/toaster'
import { useCardinal } from '@/lib/cardinal-provider'
import { lastQueryOptions, worldQueryOptions } from '@/lib/query-options'
import { MessageOrQuery } from '@/lib/types'
import { cn } from '@/lib/utils'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  const { cardinalUrl, setCardinalUrl, isCardinalConnected } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))

  // HACK: filter out messages/queries that don't use /{tx,query}/game/... endpoints
  // until we get the full endpoint from /debug/world or if we decided not to even
  // send them from the server.
  const builtin: { messages: { [key: string]: boolean }; queries: { [key: string]: boolean } } = {
    messages: {
      'create-persona': true,
    },
    queries: {
      signer: true,
      state: true,
      list: true,
    },
  }
  const sidebarItems = [
    {
      title: 'Messages',
      type: 'message',
      icon: <MessageSquareCode size={20} strokeWidth={2.1} />,
      items: data?.messages.filter((m) => !builtin.messages[m.name]) ?? [],
    },
    {
      title: 'Queries',
      type: 'query',
      icon: <SearchCode size={20} strokeWidth={2.1} />,
      items: data?.queries.filter((q) => !builtin.queries[q.name]) ?? [],
    },
  ]

  return (
    <>
      <header className="border-b">
        <nav className="flex items-center justify-between px-3 h-12">
          <Link to="/">
            <img src={logo} width={32} height={32} />
          </Link>
          <div className="flex items-center gap-2">
            <label htmlFor="host" className="flex-shrink-0 text-xs text-muted-foreground">
              Cardinal URL
            </label>
            <Input
              id="host"
              placeholder="localhost:4040"
              value={cardinalUrl}
              onChange={(e) => setCardinalUrl(e.target.value)}
              className="h-8"
            />
            <div
              className={cn(
                'size-2 rounded-full flex-shrink-0',
                isCardinalConnected ? 'bg-green-500' : 'bg-red-500',
              )}
            />
          </div>
        </nav>
      </header>
      <main className="flex min-h-[calc(100%-3rem-1px)]">
        <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 border-r text-sm">
          <div>
            {sidebarItems.map((item, i) => (
              <SideBarItem key={i} item={item} />
            ))}
          </div>
          <ThemeToggle className="self-end" />
        </aside>
        <div className="w-full">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <div className="bg-muted h-full px-4 pt-4 pb-16 overflow-y-auto">
                <Outlet />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <BottomBar />
          </ResizablePanelGroup>
        </div>
      </main>
      <Toaster />
    </>
  )
}

interface SideBarItemProps {
  item: {
    title: string
    type: string
    icon: React.ReactNode
    items: MessageOrQuery[]
  }
}

function SideBarItem({ item }: SideBarItemProps) {
  return (
    <>
      <Accordion collapsible type="single" defaultValue="default">
        <AccordionItem value="default" className="border-0">
          <AccordionTrigger className="px-2">
            <p className="flex items-center gap-2 font-bold">
              {item.icon} {item.title}
            </p>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            {item.items.length === 0 ? (
              <div className="flex flex-col gap-4 items-center bg-muted text-muted-foreground py-4 rounded-lg">
                <BookDashed size={24} strokeWidth={2.5} />
                <div className="space-y-2 text-center">
                  <p className="text-xs font-semibold">No {item.title} Found</p>
                </div>
              </div>
            ) : (
              item.items.map((msgOrQry, i) => (
                <MessageQueryAccordion key={i} type={item.type} msgOrQry={msgOrQry} />
              ))
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

interface MessageQueryAccordionProps {
  type: string
  msgOrQry: MessageOrQuery
}

function MessageQueryAccordion({ type, msgOrQry }: MessageQueryAccordionProps) {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const [fields, setFields] = useState<{ [param: string]: string }>(
    Object.keys(msgOrQry.fields).reduce((acc, i) => ({ ...acc, [i]: '' }), {}),
  )
  const queryClient = useQueryClient()

  const formatName = (name: string) => {
    const s = name.replace(/-/g, ' ')
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const handleClick = async () => {
    if (type === 'message') {
      alert("We don't support sending messages yet...")
      return
    }
    const ns = type === 'message' ? 'tx' : 'query'
    // TODO: figure out if we need to get personaTag from user or we can use random values
    const base = {
      personaTag: '', // this is required!
      namespace: '',
      nonce: 0,
      signature: '',
    }
    const body = type === 'message' ? { ...base, body: fields } : fields
    await queryClient.fetchQuery(
      lastQueryOptions({
        cardinalUrl,
        isCardinalConnected,
        ns,
        body,
        name: msgOrQry.name,
      }),
    )
  }

  return (
    <Accordion collapsible type="single" className="bg-muted border border-border rounded-lg">
      <AccordionItem value="default" className="border-0 [&_.params]:data-[state=open]:hidden">
        <AccordionTrigger
          title={formatName(msgOrQry.name)}
          className="p-2 max-w-full rounded-lg border-border data-[state=closed]:border-b data-[state=closed]:bg-background"
        >
          <p className="text-sm text-left max-w-[85%] truncate">{formatName(msgOrQry.name)}</p>
        </AccordionTrigger>
        <div className="params px-2 py-0.5 font-medium text-xs text-muted-foreground truncate">
          {Object.keys(msgOrQry.fields).join(', ')}
        </div>
        <AccordionContent className="p-2 space-y-2">
          {Object.keys(msgOrQry.fields).map((param) => (
            <div key={param} className="space-y-1">
              <p className="font-medium space-x-2">
                <span>{param}</span>
                <span className="text-muted-foreground font-normal">{msgOrQry.fields[param]}</span>
              </p>
              <Input
                value={fields[param]}
                onChange={(e) => setFields({ ...fields, [param]: e.target.value })}
                className="h-8"
              />
            </div>
          ))}
          <Button onClick={() => void handleClick()} className="w-full h-8">
            Send
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
