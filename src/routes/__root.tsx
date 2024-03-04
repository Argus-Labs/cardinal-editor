import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BookDashed, MessageSquareCode, SearchCode } from 'lucide-react'

import logo from '@/assets/world.svg'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useCardinal } from '@/lib/cardinal-provider'
import { MessageOrQuery, WorldResponse } from '@/lib/types'
import { worldQueryOptions } from '@/lib/query-options'

export const Route = createRootRoute({
  component: Root
})

function Root() {
  const { cardinalUrl, setCardinalUrl, isCardinalConnected } = useCardinal()
  const { data } = useQuery<WorldResponse>(worldQueryOptions({ cardinalUrl, isCardinalConnected }))

  const sidebarItems = [
    {
      title: 'Messages',
      icon: <MessageSquareCode size={20} strokeWidth={2.1} />,
      items: data?.messages ?? []
    },
    {
      title: 'Queries',
      icon: <SearchCode size={20} strokeWidth={2.1} />,
      items: data?.queries ?? []
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
            <label htmlFor="host" className="flex-shrink-0 text-xs text-muted-foreground">Cardinal URL</label>
            <Input
              id="host"
              placeholder="localhost:4040"
              value={cardinalUrl}
              onChange={(e) => setCardinalUrl(e.target.value)}
              className="h-8"
            />
            <div className={cn("size-2 rounded-full flex-shrink-0", isCardinalConnected ? "bg-green-500" : "bg-red-500")} />
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
        <div className="bg-muted w-full px-4 pt-4 pb-2">
          <Outlet />
        </div>
      </main>
    </>
  )
}

interface SideBarItemProps {
  item: {
    title: string,
    icon: React.ReactNode,
    items: MessageOrQuery[]
  }
}

function SideBarItem({ item }: SideBarItemProps) {
  const items = item.items
  const formatName = (name: string) => {
    let s = name.replace(/-/g, ' ')
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <>
      <Accordion collapsible type="single" defaultValue="default">
        <AccordionItem value="default" className="border-0">
          <AccordionTrigger className="px-2">
            <p className="flex items-center gap-2 font-bold">{item.icon} {item.title}</p>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            {items.length > 0 ? (
              items.map((item, i) => (
                <Accordion
                  collapsible
                  key={i}
                  type="single"
                  className="bg-muted border border-border rounded-lg"
                >
                  <AccordionItem value="default" className="border-0 [&_.params]:data-[state=open]:hidden">
                    <AccordionTrigger
                      title={formatName(item.name)}
                      className="p-2 max-w-full rounded-lg border-border data-[state=closed]:border-b data-[state=closed]:bg-background"
                    >
                      <p className="text-sm text-left max-w-[85%] truncate">{formatName(item.name)}</p>
                    </AccordionTrigger>
                    <div className="params px-2 py-0.5 font-medium text-xs text-muted-foreground truncate">
                      {Object.keys(item.fields).join(', ')}
                    </div>
                    <AccordionContent className="p-2 space-y-2">
                      {Object.keys(item.fields).map((param) => (
                        <div key={param} className="space-y-1">
                          <p className="font-medium space-x-2">
                            <span>{param}</span>
                            <span className="text-muted-foreground font-normal">{item.fields[param]}</span>
                          </p>
                          <Input className="h-8" />
                        </div>
                      ))}
                      <Button className="w-full h-8">Send</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))
            ) : (
              <div className="flex flex-col gap-4 items-center bg-muted text-muted-foreground py-4 rounded-lg">
                <BookDashed size={24} strokeWidth={2.5} />
                <div className="space-y-2 text-center">
                  <p className="text-xs font-semibold">No {item.title} Found</p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}
