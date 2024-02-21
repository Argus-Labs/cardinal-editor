import { createContext, useContext, useEffect, useState } from 'react'

type CardinalProvideState = {
  cardinalUrl: string,
  setCardinalUrl: (url: string) => void,
  isCardinalConnected: boolean
}

type CardinalProviderProps = {
  children: React.ReactNode,
  defaultCardinalUrl?: string,
  storageKey?: string,
}

const initialState: CardinalProvideState = {
  cardinalUrl: 'http://localhost:3333',
  setCardinalUrl: () => null,
  isCardinalConnected: false,
}

const CardinalProviderContext = createContext(initialState)

export function CardinalProvider({
  children,
  defaultCardinalUrl = 'http://localhost:3333',
  storageKey = 'cardinal-url',
  ...props
}: CardinalProviderProps) {
  const [cardinalUrl, setCardinalUrl] = useState(() => localStorage.getItem(storageKey) || defaultCardinalUrl)
  const [isCardinalConnected, setIsCardinalConnected] = useState(false)

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch(`${cardinalUrl}/health`)
        setIsCardinalConnected(res.ok)
      } catch (error) {
        setIsCardinalConnected(false)
      }
    }

    ping()
    const intervalId = setInterval(ping, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const value = {
    cardinalUrl,
    setCardinalUrl: (url: string) => {
      localStorage.setItem(storageKey, url)
      setCardinalUrl(url)
    },
    isCardinalConnected,
  }

  return (
    <CardinalProviderContext.Provider {...props} value={value}>
      {children}
    </CardinalProviderContext.Provider>
  )
}

export const useCardinal = () => {
  const context = useContext(CardinalProviderContext)

  if (context === undefined) throw new Error('useCardinal must be used within a CardinalProvider')

  return context
}
