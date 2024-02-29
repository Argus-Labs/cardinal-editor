import { useState } from 'react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MultiSelect } from '@/components/multi-select';
import { EntityCard } from '@/components/entity-views';
import { useQuery } from '@tanstack/react-query';
import { Entity, WorldResponse } from '@/lib/types';
import { useCardinal } from '@/lib/cardinal-provider';
import { worldQueryOptions } from '@/lib/query-options';

// TODO: update this when registered components endpoint is done
const sampleEntity = (components: string[]): Entity => {
  return {
    id: 0,
    components: components.reduce((acc, c) => ({ ...acc, [c]: { attribute: 'dummy data' } }), {})
  }
}

export function ArchetypeSheet() {
  const cardinal = useCardinal()
  const { data } = useQuery<WorldResponse>(worldQueryOptions(cardinal))
  const [components, setComponents] = useState<string[]>([])
  const options = data?.components.map((c) => ({ label: c, value: c })) ?? []
  const hasSelectedComponents = components && components.length > 0
  const accordionValue = hasSelectedComponents ? "default" : ""

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button>New Archetype</Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle>New Archetype</SheetTitle>
              <SheetDescription>
                You can create entity "Archetypes" by grouping different components. It acts as a filter
                to only show entities containing the components you specify.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Archetype name</Label>
                <Input placeholder="New archetype..." />
              </div>
              <div className="space-y-1">
                <Label>Components</Label>
                <MultiSelect options={options} selected={components} onChange={setComponents} />
              </div>
              <Accordion
                collapsible
                type="single"
                value={accordionValue}
                className="bg-muted border border-border rounded-lg px-3 py-1"
              >
                <AccordionItem value="default" className="border-0 space-y-2">
                  <AccordionTrigger className="py-2 text-sm">Sample entities</AccordionTrigger>
                  <AccordionContent>
                    {hasSelectedComponents && (
                      <EntityCard entity={sampleEntity(components)} />
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <SheetFooter className="mt-auto">
            <SheetClose asChild>
              <Button type="submit">Create Archetype</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
