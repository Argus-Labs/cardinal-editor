import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ComponentProperty, Entity } from '@/lib/types'

interface EntityCardsListProps {
  entities: Entity[]
}

export function EntityCards({ entities }: EntityCardsListProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 3xl:flex 3xl:flex-wrap">
      {entities.map((entity) => (
        <EntityCard key={entity.id} entity={entity} />
      ))}
    </div>
  )
}

interface EntityCardProps {
  entity: Entity
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="3xl:min-w-96 bg-background border border-border rounded-lg font-mono text-sm">
      <div className="px-3 py-2 font-bold border-b border-border">Entity {entity.id}</div>
      <div className="px-3 py-2 space-y-2">
        {Object.keys(entity.components).map((name) => (
          <ComponentDetails key={name} name={name} component={entity.components[name]} />
        ))}
      </div>
    </div>
  )
}

export function EntityList({ entities }: EntityCardsListProps) {
  const defaultValues = entities.map((e) => e.id.toString())

  return (
    <Accordion type="multiple" defaultValue={defaultValues} className="font-mono space-y-1">
      {entities.map((entity) => (
        <AccordionItem key={entity.id} value={entity.id.toString()} className="border-0">
          <AccordionTrigger className="px-3 py-2 border border-border rounded-lg data-[state=open]:rounded-b-none bg-background font-bold text-sm">
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
  )
}

interface ComponentDetailsProps {
  name: string
  component: ComponentProperty
}

const formatAttribute = (attr: any): React.ReactNode => {
  switch (typeof attr) {
    case 'string':
      return <span className="text-green-500">{`"${attr}"`}</span>
    case 'number':
      return <span className="text-orange-500">{attr}</span>
    case 'boolean':
      return <span className="text-blue-500">{attr ? 'true' : 'false'}</span>
    default:
      return <span>{JSON.stringify(attr)}</span>
  }
}

function ComponentDetails({ name, component }: ComponentDetailsProps) {
  const attributes = Object.keys(component).filter((k) => !k.startsWith('_'))

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
          <p key={attr} className="ml-3 text-muted-foreground font-medium break-all">
            {attr}: {formatAttribute(component[attr])}
          </p>
        ))}
      </div>
    </details>
  )
}
