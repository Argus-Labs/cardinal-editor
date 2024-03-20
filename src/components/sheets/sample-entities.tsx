import { EntityCard } from '@/components/entity-views'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Entity, WorldField } from '@/lib/types'

const sampleEntity = (selected: string[], components: WorldField[]): Entity => {
  const componentsMap: { [key: string]: string } = components.reduce(
    (acc, c) => ({ ...acc, [c.name]: c.fields }),
    {},
  )
  return {
    id: 0,
    components: selected.reduce((acc, c) => ({ ...acc, [c]: componentsMap[c] }), {}),
  }
}

interface SampleEntitiesProps {
  selected: string[]
  components: WorldField[]
}

export function SampleEntities({ selected, components }: SampleEntitiesProps) {
  const hasSelectedComponents = selected && selected.length > 0
  const value = hasSelectedComponents ? 'default' : ''

  return (
    <Accordion
      collapsible
      type="single"
      value={value}
      className="bg-muted border border-border rounded-lg px-3 py-1"
    >
      <AccordionItem value="default" className="border-0 space-y-2">
        <AccordionTrigger className="py-2 text-sm">Sample entities</AccordionTrigger>
        <AccordionContent>
          {hasSelectedComponents && <EntityCard entity={sampleEntity(selected, components)} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
