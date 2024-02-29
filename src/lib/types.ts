export interface Components {
  [name: string]: object
}

export interface Entity {
  id: number,
  components: Components
}

export interface MessageOrQuery {
  name: string,
  fields: {
    [param: string]: string
  }
}

export interface WorldResponse {
  components: string[],
  messages: MessageOrQuery[],
  queries: MessageOrQuery[],
}
