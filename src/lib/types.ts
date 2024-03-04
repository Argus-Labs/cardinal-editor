export interface Components {
  [name: string]: object
}

export interface Entity {
  id: number,
  components: Components
}
