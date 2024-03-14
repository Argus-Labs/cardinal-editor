import { createRootRoute, Outlet } from '@tanstack/react-router'

import { BottomBar } from '@/components/bottom-bar'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/toaster'
import { useCardinal } from '@/lib/cardinal-provider'
import { syncStateQueryOptions } from '@/lib/query-options'
import { useQuery } from '@tanstack/react-query'
import { useConfig } from '@/lib/config-provider'
import { useEffect } from 'react'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  const { config, setConfig } = useConfig()
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { data: entities } = useQuery(syncStateQueryOptions({ cardinalUrl, isCardinalConnected }))

  // syncs local personas with cardinal's. this is needed for running with `world cardinal start`,
  // where the state is persisted accross restarts. this is needed to keep track of the last nonce 
  // used by each signer.
  useEffect(() => {
    const personas = config.personas.filter((p) => {
      const match = entities?.filter((e) => {
        const signer = e.components['SignerComponent']
        if (!signer) return false
        // @ts-ignore
        return signer['PersonaTag'] === p.personaTag && signer['SignerAddress'] === p.address
      })
      return match && match.length !== 0
    })
    setConfig({ ...config, personas: personas })
  }, [])

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100%-3rem-1px)]">
        <Sidebar />
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
