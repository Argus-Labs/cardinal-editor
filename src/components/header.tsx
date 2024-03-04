import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import logo from '@/assets/world.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'
import { cn } from '@/lib/utils'

export function Header() {
  const { cardinalUrl, setCardinalUrl, isCardinalConnected } = useCardinal()
  const [fetching, setFetching] = useState(false)
  const queryClient = useQueryClient()

  const refetchWorld = () => {
    setFetching(true)
    queryClient.fetchQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
    setTimeout(() => setFetching(false), 900)
  }

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between px-3 h-12">
        <img src={logo} width={32} height={32} />
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
          <Button
            variant="outline"
            size="icon"
            className="size-8 flex-shrink-0"
            title="Refresh world"
            onClick={refetchWorld}
          >
            <RefreshCw size={16} className={cn(fetching && 'animate-spin')} />
          </Button>
          <div
            className={cn(
              'size-2 rounded-full flex-shrink-0',
              isCardinalConnected ? 'bg-green-500' : 'bg-red-500',
            )}
          />
        </div>
      </nav>
    </header>
  )
}
