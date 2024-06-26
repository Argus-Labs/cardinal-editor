import { useQueryClient } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

import { BottomBar } from '@/components/bottom-bar'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { createPersonaAccount } from '@/lib/account'
import { useCardinal } from '@/lib/cardinal-provider'
import {
  personaQueryOptions,
  routeEvents,
  syncStateQueryOptions,
  worldQueryOptions,
} from '@/lib/query-options'
import { errorToast } from '@/lib/utils'

export const Route = createRootRoute({
  component: Root,
})

interface CardinalEvent {
  Events: string[]
}

function Root() {
  const { personas, setPersonas, cardinalUrl, isCardinalConnected } = useCardinal()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    const sync = async () => {
      try {
        // syncs local personas with cardinal's. this is needed for running with `world cardinal start`,
        // where the state is persisted accross restarts. this is needed to keep track of the last nonce
        // used by each signer.
        const entities = await queryClient.fetchQuery(
          syncStateQueryOptions({ cardinalUrl, isCardinalConnected }),
        )
        const newPersonas = personas.filter((p) => {
          const match = entities?.filter((e) => {
            const signer = e.components['SignerComponent']
            if (!signer) return false
            return signer['PersonaTag'] === p.personaTag && signer['SignerAddress'] === p.address
          })
          return match && match.length !== 0
        })
        setPersonas(newPersonas)

        // if there is no default persona (_test_persona), create it
        const personaTag = '_test_persona'
        if (newPersonas.filter((p) => p.personaTag === personaTag).length > 0) return

        try {
          const { namespace } = await queryClient.fetchQuery(
            worldQueryOptions({ cardinalUrl, isCardinalConnected }),
          )
          const { privateKey, address, sign } = createPersonaAccount(personaTag)
          const nonce = 0
          const message = `${personaTag}${namespace}${nonce}{"personaTag":"${personaTag}","signerAddress":"${address}"}`
          const signature = sign(message)
          const body = {
            personaTag,
            nonce,
            signature,
            namespace,
            body: { personaTag, signerAddress: address },
          }
          try {
            const receipt = await queryClient.fetchQuery(
              personaQueryOptions({ cardinalUrl, isCardinalConnected, body }),
            )

            if (!receipt.receipts) return
            const result = receipt.receipts[0]
            if (result.result) {
              const newPersona = { personaTag, privateKey, address, nonce: nonce + 1 }
              setPersonas([...newPersonas, newPersona])
            }
          } catch (error) {
            errorToast(toast, error, 'Failed to create test persona')
          }
        } catch (error) {
          errorToast(toast, error, 'Failed to fetch cardinal namespace')
        }
      } catch (error) {
        errorToast(toast, error, 'Failed to sync personas')
      }
    }
    if (isCardinalConnected) sync().catch((e) => console.log(e))
  }, [isCardinalConnected, cardinalUrl, toast])

  // setup websocket connection to receive events
  useEffect(() => {
    const wsCardinalUrl = cardinalUrl.replace(/https|http/, 'ws')
    const ws = new WebSocket(`${wsCardinalUrl}${routeEvents}`)
    ws.onopen = () => console.log('Connected to events ws')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as CardinalEvent
      if (data.Events && data.Events.length > 0) {
        // data.Events is an array of base64-ed JSON representation of an event
        const event = JSON.parse(atob(data.Events[0])) as { [key: string]: string }
        toast({ title: event.event })
      }
    }
    return () => ws.close()
  }, [isCardinalConnected, cardinalUrl, toast])

  return (
    <>
      <Header />
      <main className="flex h-[calc(100%-3rem-1px)]">
        <Sidebar />
        <div className="w-full">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel className="relative">
              <div className="bg-muted h-full px-4 pt-4 pb-16 overflow-y-auto">
                <Outlet />
              </div>
              <Toaster />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <BottomBar />
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}
