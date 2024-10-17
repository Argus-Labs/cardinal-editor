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
  nonce: number
}

export interface TransactionReturn {
  TxHash: string
  Tick: number
}

export interface Receipt {
  startTick: number
  endTick: number
  receipts:
    | {
        txHash: string
        tick: number
        result: object | null
        errors: string[] | null
      }[]
    | null
}

export interface JaegerServicesResponse {
  data: string[]
  total: number
  limit: number
  offset: number
  errors: string[] | null
}
