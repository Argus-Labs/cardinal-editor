import { createContext, useContext, useEffect, useState } from 'react'

import { Persona } from '@/lib/types'

interface EntityGroup {
  name: string
  components: string[]
}

type ConfigItem = string | EntityGroup[] | Persona[]

interface Config {
  cardinalUrl: string
  view: string // 'card' | 'list'
  entityGroups: EntityGroup[]
  personas: Persona[]
}

interface Projects {
  [projectID: string]: Config
}

interface CardinalProviderState {
  cardinalUrl: string
  setCardinalUrl: (cardinalUrl: string) => void
  isCardinalConnected: boolean
  view: string
  setView: (view: string) => void
  entityGroups: EntityGroup[]
  setEntityGroups: (entityGroups: EntityGroup[]) => void
  personas: Persona[]
  setPersonas: (personas: Persona[]) => void
}

interface CardinalProviderProps {
  children: React.ReactNode
}

const storageKey = 'ce-config'
const defaultCardinalUrl = 'http://localhost:4040'
const defaultView = 'card'
const defaultEntityGroups: EntityGroup[] = [
  {
    name: 'Personas',
    components: ['SignerComponent'],
  },
]
const defaultPersonas: Persona[] = []
const defaultConfig: Config = {
  cardinalUrl: defaultCardinalUrl,
  view: defaultView,
  entityGroups: defaultEntityGroups,
  personas: defaultPersonas,
}
const defaultProject: Projects = {
  __CARDINAL_PROJECT_ID__: defaultConfig,
}
const initialState: CardinalProviderState = {
  ...defaultConfig,
  isCardinalConnected: false,
  setCardinalUrl: () => null,
  setView: () => null,
  setEntityGroups: () => null,
  setPersonas: () => null,
}

const CardinalProviderContext = createContext(initialState)

export function CardinalProvider({ children, ...props }: CardinalProviderProps) {
  const [config, setConfig] = useState(() => {
    const rawConfig = localStorage.getItem(storageKey)
    if (!rawConfig) {
      localStorage.setItem(storageKey, JSON.stringify(defaultProject))
      return defaultConfig
    }
    const config = JSON.parse(rawConfig) as Projects
    if (!config[__CARDINAL_PROJECT_ID__]) {
      localStorage.setItem(storageKey, JSON.stringify({ ...config, ...defaultProject }))
      return defaultConfig
    }
    return config[__CARDINAL_PROJECT_ID__]
  })
  const [isCardinalConnected, setIsCardinalConnected] = useState(false)

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch(`${config.cardinalUrl}/health`)
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
  }, [config])

  const setConfigItem = (key: string, value: ConfigItem) => {
    const projects = JSON.parse(localStorage.getItem(storageKey)!) as Projects
    const newConfig = { ...projects[__CARDINAL_PROJECT_ID__], [key]: value }
    const newProjects = { ...projects, [__CARDINAL_PROJECT_ID__]: newConfig }
    localStorage.setItem(storageKey, JSON.stringify(newProjects))
    setConfig(newConfig)
  }

  const value = {
    ...config,
    isCardinalConnected,
    setCardinalUrl: (cardinalUrl: string) => setConfigItem('cardinalUrl', cardinalUrl),
    setView: (view: string) => setConfigItem('view', view),
    setEntityGroups: (entityGroups: EntityGroup[]) => setConfigItem('entityGroups', entityGroups),
    setPersonas: (personas: Persona[]) => setConfigItem('personas', personas),
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
