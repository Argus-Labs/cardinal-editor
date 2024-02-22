import logo from '@/assets/world.svg'
import { Link } from '@tanstack/react-router'
import { Input } from './ui/input'
import { ThemeToggle } from './theme-toggle'
import { useCardinal } from '@/lib/cardinal-provider'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode,
  sidebarItems: any[]
}

export function Layout({ children, sidebarItems }: LayoutProps) {
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
              <p key={i} className="font-bold px-2 py-1">{item.title}</p>
            ))}
          </div>
          <ThemeToggle className="self-end" />
        </aside>
        <div className="bg-muted w-full px-4 pt-4 pb-2">
          {children}
        </div>
      </main>
    </>
  )
}
