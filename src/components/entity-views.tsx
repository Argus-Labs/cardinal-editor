import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useConfig } from "@/lib/config-provider"
import { Entity } from "@/lib/types"
import { Edit } from "lucide-react"
import { Button } from "./ui/button"

interface EntityViewsProps {
  view: string,
  entities: Entity[]
}

// TODO: make this responsive, along with the sidebar
export function EntityView({ view, entities }: EntityViewsProps) {
  const { config: { entityGroups } } = useConfig()

  // TODO: this is probably very inefficient. come up with a better filter algorithm
  const grouped = new Set()
  const filtered = entityGroups.map((a) => ({
    ...a,
    entities: entities.filter((e) => {
      const exists = a.components.filter((c) => e.components[c]).length > 0
      if (exists) grouped.add(e.id)
      return exists
    })
  }))
  const ungrouped = entities.filter((e) => !grouped.has(e.id))

  return (
    <>
      <div className="space-y-4">
        {filtered.map(({ name, components, entities }) => (
          <div key={name} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <h2 className="font-semibold">{name}</h2>
                <Button variant="ghost" size="icon" className="size-8">
                  <Edit size={16} />
                </Button>
                <p className="ml-auto text-muted-foreground text-xs font-medium">
                  {entities.length} results
                </p>
              </div>
              {components.map((c) => (
                <Badge key={c} className="bg-background text-foreground border border-border hover:bg-background">
                  {c}
                </Badge>
              ))}
              <hr className="border-border" />
            </div>
            {view === 'card' ? <EntityCards entities={entities} /> : <EntityList entities={entities} />}
          </div>
        ))}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Ungrouped</h2>
              <p className="text-muted-foreground text-xs font-medium">
                {ungrouped.length} results
              </p>
            </div>
            <hr className="border-border" />
          </div>
          {view === 'card' ? <EntityCards entities={ungrouped} /> : <EntityList entities={ungrouped} />}
        </div>
      </div>
    </>
  )
}

interface EntityCardsListProps {
  entities: Entity[]
}

export function EntityCards({ entities }: EntityCardsListProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 3xl:flex 3xl:flex-wrap">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>
    </>
  )
}

interface EntityCardProps {
  entity: Entity
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <>
      <div className="3xl:min-w-96 bg-background border border-border rounded-lg font-mono text-sm">
        <div className="px-3 py-2 font-bold border-b border-border">
          Entity {entity.id}
        </div>
        <div className="px-3 py-2 space-y-2">
          {Object.keys(entity.components).map((name) => (
            <ComponentDetails key={name} name={name} component={entity.components[name]} />
          ))}
        </div>
      </div>
    </>
  )
}

export function EntityList({ entities }: EntityCardsListProps) {
  return (
    <>
      <Accordion type="multiple" className="font-mono space-y-1">
        {entities.map((entity) => (
          <AccordionItem key={entity.id} value={entity.id.toString()} className="border-0">
            <AccordionTrigger
              className="px-3 py-2 border border-border rounded-lg data-[state=open]:rounded-b-none bg-background font-bold text-sm"
            >
              Entity {entity.id}
            </AccordionTrigger>
            <AccordionContent
              asChild
              className="px-3 py-2 border border-t-0 border-border rounded-b-lg bg-background whitespace-pre-wrap text-xs"
            >
              {Object.keys(entity.components).map((name) => (
                <ComponentDetails key={name} name={name} component={entity.components[name]} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}

interface ComponentDetailsProps {
  name: string
  component: object
}

// TODO: add case for object types (arrays are included as objects too)
const formatAttribute = (attr: any): React.ReactNode => {
  switch (typeof attr) {
    case 'string': return <span className="text-green-500">{`"${attr}"`}</span>
    case 'number': return <span className="text-orange-500">{attr}</span>
    case 'boolean': return <span className="text-blue-500">{attr}</span>
    default: return <span>{attr}</span>
  }
}

function ComponentDetails({ name, component }: ComponentDetailsProps) {
  const attributes = Object.keys(component).filter((k) => !k.startsWith("_"))

  return (
    // 0.8125rem / 13px since the default sizes are too small/big
    <details open className="space-y-1 text-[0.8125rem]">
      <summary className="font-bold">
        {name}
        <span className="ml-2 text-muted-foreground font-medium">
          {`{} ${attributes.length} keys`}
        </span>
      </summary>
      <div>
        {attributes.map((attr) => (
          <p key={attr} className="ml-3 text-muted-foreground font-medium">
            {/* @ts-ignore */}
            {attr}: {formatAttribute(component[attr])}
          </p>
        ))}
      </div>
    </details>
  )
}
