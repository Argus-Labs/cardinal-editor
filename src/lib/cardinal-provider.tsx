import { createContext, useContext, useEffect, useState } from 'react'

interface CardinalProviderState {
  cardinalUrl: string
  setCardinalUrl: (url: string) => void
  isCardinalConnected: boolean
  cardinalNamespace: string
}

interface CardinalProviderProps {
  children: React.ReactNode
}

// TODO: consider whether to put cardinal url/port in .env too
const storageKey = 'cardinal-url'
const defaultCardinalUrl = 'http://localhost:4040'
const defaultCardinalNamespace = import.meta.env.CARDINAL_NAMESPACE || 'world-1'
const initialState: CardinalProviderState = {
  cardinalUrl: defaultCardinalUrl,
  setCardinalUrl: () => null,
  isCardinalConnected: false,
  cardinalNamespace: defaultCardinalNamespace,
}

const CardinalProviderContext = createContext(initialState)

export function CardinalProvider({ children, ...props }: CardinalProviderProps) {
  const [cardinalUrl, setCardinalUrl] = useState(
    () => localStorage.getItem(storageKey) || defaultCardinalUrl,
  )
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
      .then(() => console.log('Connected to Cardinal'))
      .catch((error) => console.log(error))
    const intervalId = setInterval(() => void ping(), 1000)

    return () => clearInterval(intervalId)
  }, [cardinalUrl])

  const value = {
    cardinalUrl,
    setCardinalUrl: (url: string) => {
      localStorage.setItem(storageKey, url)
      setCardinalUrl(url)
    },
    isCardinalConnected,
    cardinalNamespace: defaultCardinalNamespace,
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
