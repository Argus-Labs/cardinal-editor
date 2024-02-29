interface cardinalQueryOptionsProps {
  cardinalUrl: string
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
