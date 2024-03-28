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
    const res = await fetch(`${cardinalUrl}/debug/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/debug/state`)
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
    const res = await fetch(`${cardinalUrl}/debug/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${cardinalUrl}/debug/state`)
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

interface gameQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  url: string
  body: object
}

export const gameQueryOptions = ({
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
      throw new Error(`Failed to fetch ${cardinalUrl}${url}`)
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
