export interface Components {
  [name: string]: object
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
}

export interface Persona {
  personaTag: string
  privateKey: string
  address: string
  nonce: number
}
