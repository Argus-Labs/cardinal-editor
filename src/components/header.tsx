import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import logoDark from '@/assets/world-dark.svg'
import logoLight from '@/assets/world-light.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'
import { cn, errorToast } from '@/lib/utils'

export function Header() {
  const { cardinalUrl, setCardinalUrl, isCardinalConnected } = useCardinal()
  const [fetching, setFetching] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const refetchWorld = async () => {
    setFetching(true)
    try {
      await queryClient.fetchQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
    } catch (error) {
      errorToast(toast, error, 'Error re-fetching world')
    }
    setTimeout(() => setFetching(false), 900)
  }

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between px-3 h-12">
        <img src={logoLight} width={32} height={32} className="dark:hidden" />
        <img src={logoDark} width={32} height={32} className="hidden dark:block" />
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
            onClick={() => void refetchWorld()}
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
