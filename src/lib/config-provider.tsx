import { createContext, useContext, useState } from "react"

// yes, enums would work here. it just requires more work and can be deffered for now
interface Config {
  view: string, // 'card' | 'list'
}

interface ConfigProviderState {
  config: Config,
  setConfig: (config: Config) => void,
}

interface ConfigProviderProps {
  children: React.ReactNode
}

const storageKey = 'ce-config'
const defaultValue: Config = {
  view: 'card',
}
const initialState: ConfigProviderState = {
  config: defaultValue,
  setConfig: () => null,
}

const ConfigProviderContext = createContext(initialState)

export function ConfigProvider({ children, ...props }: ConfigProviderProps) {
  const [config, setConfig] = useState(() => {
    const config = localStorage.getItem(storageKey)
    return config ? JSON.parse(config) : defaultValue
  })

  const value = {
    config,
    setConfig: (config: Config) => {
      localStorage.setItem(storageKey, JSON.stringify(config))
      setConfig(config)
    }
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