import { createContext, useContext, useState } from 'react'

import { Persona } from '@/lib/types'

interface EntityGroup {
  name: string
  components: string[]
}

type ConfigItem = string | EntityGroup[] | Persona[]

interface Config {
  view: string // 'card' | 'list'
  entityGroups: EntityGroup[]
  personas: Persona[]
}

interface Projects {
  [projectID: string]: Config
}

interface ConfigProviderState {
  view: string
  setView: (view: string) => void
  entityGroups: EntityGroup[]
  setEntityGroups: (entityGroups: EntityGroup[]) => void
  personas: Persona[]
  setPersonas: (personas: Persona[]) => void
}

interface ConfigProviderProps {
  children: React.ReactNode
}

const storageKey = 'ce-config'
const defaultView = 'card'
const defaultEntityGroups: EntityGroup[] = [
  {
    name: 'Personas',
    components: ['SignerComponent'],
  },
]
const defaultPersonas: Persona[] = []
const defaultConfig: Config = {
  view: defaultView,
  entityGroups: defaultEntityGroups,
  personas: defaultPersonas,
}
const defaultProject: Projects = {
  __CARDINAL_PROJECT_ID__: defaultConfig,
}
const initialState: ConfigProviderState = {
  ...defaultConfig,
  setView: () => null,
  setEntityGroups: () => null,
  setPersonas: () => null,
}

const ConfigProviderContext = createContext(initialState)

export function ConfigProvider({ children, ...props }: ConfigProviderProps) {
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

  const setConfigItem = (key: string, value: ConfigItem) => {
    const projects = JSON.parse(localStorage.getItem(storageKey)!) as Projects
    const newConfig = { ...projects[__CARDINAL_PROJECT_ID__], [key]: value }
    const newProjects = { ...projects, [__CARDINAL_PROJECT_ID__]: newConfig }
    localStorage.setItem(storageKey, JSON.stringify(newProjects))
    setConfig(newConfig)
  }

  const value = {
    ...config,
    setView: (view: string) => setConfigItem('view', view),
    setEntityGroups: (entityGroups: EntityGroup[]) => setConfigItem('entityGroups', entityGroups),
    setPersonas: (personas: Persona[]) => setConfigItem('personas', personas),
  }

  return (
    <ConfigProviderContext.Provider {...props} value={value}>
      {children}
    </ConfigProviderContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigProviderContext)

  if (context === undefined) throw new Error('useConfig must be used within a CardinalProvider')

  return context
}
