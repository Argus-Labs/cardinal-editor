import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Entity } from "@/lib/types"

interface EntityViewsProps {
  entities: Entity[]
}

// TODO: make this responsive, along with the sidebar
export function EntityCards({ entities }: EntityViewsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
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
      <div className="bg-background border border-border rounded-lg font-mono text-sm">
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

export function EntityList({ entities }: EntityViewsProps) {
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