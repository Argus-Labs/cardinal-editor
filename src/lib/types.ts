export interface Components {
  [name: string]: {
    [property: string]: any
  }
}

export interface Entity {
  id: number
  components: Components
}

export interface WorldField {
  name: string
  fields: {
    [param: string]: string
  }
}

export interface WorldResponse {
  components: WorldField[]
  messages: WorldField[]
  queries: WorldField[]
  namespace: string
}

export interface Persona {
  personaTag: string
  privateKey: string
  address: string
  nonce: number
}
