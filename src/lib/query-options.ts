import { Entity, Receipt, TransactionReturn, WorldResponse } from '@/lib/types'
import { sleep } from '@/lib/utils'

// TODO: consider returning error status & message instead of throwing

// builtin endpoints
export const routeDebugState = '/debug/state'
export const routeHealth = '/health'
export const routeWorld = '/world'
export const routeCql = '/cql'
export const routeMsgCreatePersona = '/tx/persona/create-persona'
export const routeMsgAuthorizePersonaAddress = '/tx/game/authorize-persona-address'
export const routeQryPersonaSigner = '/query/persona/signer'
export const routeQryReceiptsList = '/query/receipts/list'

interface cardinalQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  body?: object
}

export const stateQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['state'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${routeDebugState}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeDebugState}: ${error}`)
    }
    return res.json() as Promise<Entity[]>
  },
  refetchInterval: 1000,
  enabled: isCardinalConnected,
})

export const syncStateQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['sync-state'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${routeDebugState}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeDebugState}: ${error}`)
    }
    return res.json() as Promise<Entity[]>
  },
  enabled: isCardinalConnected,
})

export const worldQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['world'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${routeWorld}`)
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeWorld}: ${error}`)
    }
    return res.json() as Promise<WorldResponse>
  },
  enabled: isCardinalConnected,
})

interface gameQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  url: string
  body: object
}

export const gameQueryQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  url,
  body,
}: gameQueryOptionsProps) => ({
  queryKey: ['game'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${url}: ${error}`)
    }
    return res.json()
  },
  enabled: isCardinalConnected,
})

export const gameMessageQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  url,
  body,
}: gameQueryOptionsProps) => ({
  queryKey: ['game'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${url}: ${error}`)
    }
    const tx = (await res.json()) as TransactionReturn

    await sleep(1000)

    const receiptBody = { startTick: tx.Tick }
    const receipt = await fetch(`${cardinalUrl}${routeQryReceiptsList}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptBody),
    })
    if (!receipt.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeQryReceiptsList}: ${error}`)
    }
    return receipt.json() as Promise<Receipt>
  },
  enabled: isCardinalConnected,
})

export const personaQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  body,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['persona'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}${routeMsgCreatePersona}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeMsgCreatePersona}: ${error}`)
    }
    const tx = (await res.json()) as TransactionReturn

    await sleep(1000)

    const receiptBody = { startTick: tx.Tick }
    const receipt = await fetch(`${cardinalUrl}${routeQryReceiptsList}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptBody),
    })
    if (!receipt.ok) {
      const error = await res.text()
      throw new Error(`Error fetching ${cardinalUrl}${routeQryReceiptsList}: ${error}`)
    }
    return receipt.json() as Promise<Receipt>
  },
  enabled: isCardinalConnected,
})
