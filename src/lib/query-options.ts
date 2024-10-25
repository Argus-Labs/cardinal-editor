import { Entity, WorldResponse } from '@/lib/types'
import { sleep } from '@/lib/utils'

// cardinal builtin endpoints
export const routeDebugState = '/debug/state'
export const routeHealth = '/health'
export const routeWorld = '/world'
export const routeCql = '/cql'
export const routeEvents = '/events'
export const routeMsgCreatePersona = '/tx/persona/create-persona'
export const routeMsgAuthorizePersonaAddress = '/tx/game/authorize-persona-address'
export const routeQryPersonaSigner = '/query/persona/signer'
export const routeQryReceiptsList = '/query/receipts/list'

// jaeger endpoints
export const routeJaegerServices = '/api/services'
export const routeJaegerSearch = '/search'

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

interface TransactionReturn {
  TxHash: string
  Tick: number
}

interface Receipt {
  startTick: number
  endTick: number
  receipts:
    | {
        txHash: string
        tick: number
        result: object | null
        errors: string[] | null
      }[]
    | null
}

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

interface JaegerQueryOptionProps {
  jaegerUrl: string
  options?: {
    service: string
    operation?: string
    tags?: string
    lookback: string
    maxDuration?: string
    minDuration?: string
    limit: number
  }
}

export interface JaegerServicesResponse {
  data: string[]
  total: number
  limit: number
  offset: number
  errors: string[] | null
}

export const jaegerServicesQueryOptions = ({ jaegerUrl }: JaegerQueryOptionProps) => ({
  queryKey: ['jaegerServicesAndOperations'],
  queryFn: async () => {
    const res = await fetch(`${jaegerUrl}${routeJaegerServices}`)
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`error fetching ${jaegerUrl}${routeJaegerServices}: ${error}`)
    }

    const data = (await res.json()) as JaegerServicesResponse
    if (data.errors) {
      throw new Error(`error fetching ${jaegerUrl}${routeJaegerServices}: ${data.errors}`)
    }

    const services: { [k: string]: string[] } = {}
    for (const service of data.data) {
      const url = `${jaegerUrl}${routeJaegerServices}/${service}/operations`
      const res = await fetch(url)
      if (!res.ok) {
        const error = await res.text()
        throw new Error(`error fetching ${url}: ${error}`)
      }
      const operation = (await res.json()) as JaegerServicesResponse
      // assume if 1 operation request errors, error the whole request
      if (operation.errors) {
        throw new Error(`error fetching ${url}: ${operation.errors}`)
      }
      services[service] = operation.data
    }

    return services
  },
})

function getDurationMicroSeconds(lookback: string) {
  const lookupSeconds: { [k: string]: number } = {
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  }
  const unit = lookback[lookback.length - 1]
  const unitToSeconds = lookupSeconds[unit]
  const seconds = parseInt(lookback.slice(0, -1), 10)
  return seconds * unitToSeconds * 1_000_000
}

// since we're embedding an iframe, instead of fetching the page here, we're just
// returning the url with the search params. we're effectively using tanstack query
// as a state management tool instead of putting it in a react context
export const jaegerSearchQueryOptions = ({ jaegerUrl, options }: JaegerQueryOptionProps) => ({
  queryKey: ['jaegerSearch'],
  queryFn: () => {
    if (!options) return // unreachable
    const url = new URL(routeJaegerSearch, jaegerUrl)

    url.searchParams.append('service', options.service)
    url.searchParams.append('lookback', options.lookback)
    url.searchParams.append('limit', options.limit.toString())
    url.searchParams.append('uiEmbed', 'v0')

    const now = Date.now() * 1000 // convert to microseconds
    url.searchParams.append('start', (now - getDurationMicroSeconds(options.lookback)).toString())
    url.searchParams.append('end', now.toString())

    if (options.operation && options.operation.length > 0) {
      url.searchParams.append('operation', options.operation)
    }
    if (options.tags && options.tags.length > 0) {
      url.searchParams.append('tags', options.tags)
    }
    if (options.maxDuration && options.maxDuration.length > 0) {
      url.searchParams.append('maxDuration', options.maxDuration)
    }
    if (options.minDuration && options.minDuration.length > 0) {
      url.searchParams.append('minDuration', options.minDuration)
    }

    return url.toString()
  },
})
