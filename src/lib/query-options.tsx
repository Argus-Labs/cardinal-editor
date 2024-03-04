interface cardinalQueryOptionsProps {
  cardinalUrl: string,
  isCardinalConnected: boolean
}

export const stateQueryOptions = ({ cardinalUrl, isCardinalConnected }: cardinalQueryOptionsProps) => ({
  queryKey: ['state'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/query/debug/state`, {
      method: 'POST',
      body: '{}'
    })
    return await res.json()
  },
  refetchInterval: 1000,
  enabled: isCardinalConnected,
})

export const worldQueryOptions = ({ cardinalUrl, isCardinalConnected }: cardinalQueryOptionsProps) => ({
  queryKey: ['world'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/debug/world`)
    return await res.json()
  },
  refetchInterval: 1000 * 60 * 5, // refetch every 5 minutes
  enabled: isCardinalConnected,
})

interface lastQueryOptionsProps {
  cardinalUrl: string,
  isCardinalConnected: boolean,
  ns: string, // 'tx' | 'query'
  name: string, // endpoint name
  body: object
}

export const lastQueryOptions = ({ cardinalUrl, isCardinalConnected, ns, name, body }: lastQueryOptionsProps) => ({
  queryKey: ['last-query'],
  queryFn: async () => {
    const res = await fetch(`${cardinalUrl}/${ns}/game/${name}`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    return await res.json()
  },
  enabled: isCardinalConnected
})
