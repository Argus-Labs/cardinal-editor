import { Entity, WorldResponse } from '@/lib/types'

// TODO: consider returning error status & message instead of throwing

interface cardinalQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
}

export const stateQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['state'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/query/debug/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/query/debug/state`)
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
    const res = await fetch(`${cardinalUrl}/query/debug/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/query/debug/state`)
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
    const res = await fetch(`${cardinalUrl}/world`)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/world`)
    }
    return res.json() as Promise<WorldResponse>
  },
  enabled: isCardinalConnected,
})

interface lastQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  name: string // endpoint name
  body: object
}

export const lastQueryQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  name,
  body,
}: lastQueryOptionsProps) => ({
  queryKey: ['last-query'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/query/game/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/query/game/${name}`)
    }
    return res.json()
  },
  enabled: isCardinalConnected,
})

export const lastMessageQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  name,
  body,
}: lastQueryOptionsProps) => ({
  queryKey: ['last-query'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/tx/game/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/tx/game/${name}`)
    }
    return res.json()
  },
  enabled: isCardinalConnected,
})

interface personaQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  body: object
}

export const personaQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  body,
}: personaQueryOptionsProps) => ({
  queryKey: ['persona'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/tx/persona/create-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/tx/persona/create-persona`)
    }
    return res.json()
  },
  enabled: isCardinalConnected,
})
