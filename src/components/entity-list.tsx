import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ComponentDetails } from "@/components/component-details"
import { Entity } from "@/lib/types"

interface EntityListProps {
  entities: Entity[]
}

export function EntityList({ entities }: EntityListProps) {
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
              {entity.components.map((component) => (
                <ComponentDetails key={component.id} component={component} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
