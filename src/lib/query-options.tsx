import { Entity, WorldResponse } from '@/lib/types'

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
      body: '{}',
    })
    return res.json() as Promise<Entity[]>
  },
  refetchInterval: 1000,
  enabled: isCardinalConnected,
})

export const worldQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
}: cardinalQueryOptionsProps) => ({
  queryKey: ['world'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/world`)
    return res.json() as Promise<WorldResponse>
  },
  enabled: isCardinalConnected,
})

interface lastQueryOptionsProps {
  cardinalUrl: string
  isCardinalConnected: boolean
  ns: string // 'tx' | 'query'
  name: string // endpoint name
  body: object
}

export const lastQueryOptions = ({
  cardinalUrl,
  isCardinalConnected,
  ns,
  name,
  body,
}: lastQueryOptionsProps) => ({
  queryKey: ['last-query'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/${ns}/game/${name}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return res.json()
  },
  enabled: isCardinalConnected,
})
