import * as Sentry from '@sentry/react'
import { useQueryClient } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

import { BottomBar } from '@/components/bottom-bar'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { buttonVariants } from '@/components/ui/button'
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
import { cn, errorToast } from '@/lib/utils'

export const Route = createRootRoute({
  component: Root,
})

interface CardinalEvent {
  Events: string[]
}

function Root() {
  const { personas, setPersonas, cardinalUrl, isCardinalConnected, notifications } = useCardinal()
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
        data.Events.forEach((evt) => {
          let eventData = atob(evt)
          try {
            const json = JSON.parse(eventData) as { [k: string]: string }
            eventData = json.event
          } catch (error) {
            // this just means the backend used EmitStringEvent instead of EmitEvent,
            // we can safely ignore this error
          }
          if (notifications) {
            toast({ title: eventData })
          } else {
            console.log('Received event: ', eventData)
          }
        })
      }
    }
    return () => ws.close()
  }, [isCardinalConnected, cardinalUrl, toast, notifications])

  return (
    <Sentry.ErrorBoundary fallback={Fallback}>
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
    </Sentry.ErrorBoundary>
  )
}

function Fallback() {
  return (
    <main className="flex justify-center pt-64 bg-muted min-h-screen">
      <div className="bg-background border border-border rounded-lg max-w-xl p-4 space-y-4 self-start">
        <h1 className="font-bold">An Unexpected Error Occured</h1>
        <hr className="border-border" />
        <p className="text-sm">Looks like we missed a bug, sorry about that!</p>
        <p className="text-sm">
          Most likely we've already been notified about this error, and are working to get a fix out
          as soon as possible. In the mean time, try restarting the Cardinal Editor to see if it
          helps.
        </p>
        <p className="text-sm">
          You can also ask for help in the{' '}
          <a
            href="https://t.me/worldengine_dev"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
            rel="noopener noreferrer"
          >
            World Engine Devs Telegram group
          </a>
          .
        </p>
      </div>
    </main>
  )
}
