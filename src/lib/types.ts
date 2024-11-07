export interface ComponentProperty {
  [property: string]: string | number | boolean
}

export interface Entity {
  id: number
  components: {
    [component: string]: ComponentProperty
  }
}

export interface WorldField {
  name: string
  fields: {
    [param: string]: string
  }
  url: string
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
}
