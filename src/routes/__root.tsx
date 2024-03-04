import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { useCardinal } from '@/lib/cardinal-provider'
import logo from '@/assets/world.svg'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BookDashed, MessageSquareCode, SearchCode } from 'lucide-react'

// TODO: autofill from cardinal, will probably need custom components for queries & messages
const sidebarItems = [
  {
    title: 'Queries',
    icon: <MessageSquareCode size={20} strokeWidth={2.1} />,
    items: []
  },
  {
    title: 'Messages',
    icon: <SearchCode size={20} strokeWidth={2.1} />,
    items: []
  },
]

export const Route = createRootRoute({
  component: Root
})

function Root() {
  const { cardinalUrl, setCardinalUrl, isCardinalConnected } = useCardinal()

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
              placeholder="localhost:3333"
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
              <Accordion key={i} collapsible type="single" defaultValue="default">
                <AccordionItem value="default" className="border-0">
                  <AccordionTrigger className="px-2">
                    <p className="flex items-center gap-2 font-bold">{item.icon} {item.title}</p>
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.items.length > 0 ? (
                      <>unimplemented...</>
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
