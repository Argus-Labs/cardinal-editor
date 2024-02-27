export interface Component {
  id: number,
  name: string,
  component: Object
}

export interface Entity {
  id: number,
  components: Component[]
}
