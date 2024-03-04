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
import { useConfig } from '@/lib/config-provider';

// TODO: update this when registered components endpoint is done
const sampleEntity = (components: string[]): Entity => {
  return {
    id: 0,
    components: components.reduce((acc, c) => ({ ...acc, [c]: { attribute: 'dummy data' } }), {})
  }
}

// TODO: consider zod for form vaidation
export function EntityGroupSheet() {
  const cardinal = useCardinal()
  const { data } = useQuery<WorldResponse>(worldQueryOptions(cardinal))
  const { config, setConfig } = useConfig()
  const [entityGroupName, setEntityGroupName] = useState('')
  const [entityGroupError, setEntityGroupError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [selectedError, setSelectedError] = useState('')

  const components = data?.components.map((c) => ({ label: c, value: c })) ?? []
  const hasSelectedComponents = selected && selected.length > 0
  const accordionValue = hasSelectedComponents ? "default" : ""

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (entityGroupName.length === 0) {
      e.preventDefault()
      setEntityGroupError('Please enter a name for the entity group')
    }
    if (selected.length === 0) {
      e.preventDefault()
      setSelectedError('Please select at least 1 component')
      return
    }
    const newEntityGroup = {
      name: entityGroupName,
      components: selected
    }
    // TODO: check for duplicates
    setConfig({ ...config, entityGroups: [...config.entityGroups, newEntityGroup] })
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button>New Entity Group</Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle>New Entity Group</SheetTitle>
              <SheetDescription>
                You can create "entity groups" by grouping different components. It acts as a filter
                to only show entities containing the components you specify.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Entity group name</Label>
                <Input
                  required
                  value={entityGroupName}
                  onChange={(e) => setEntityGroupName(e.target.value)}
                  placeholder="New entity group..."
                />
                <small className="text-destructive">{entityGroupError}</small>
              </div>
              <div className="space-y-1">
                <Label>Components</Label>
                <MultiSelect options={components} selected={selected} onChange={setSelected} />
                <small className="text-destructive">{selectedError}</small>
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
                      <EntityCard entity={sampleEntity(selected)} />
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <SheetFooter className="mt-auto">
            <SheetClose asChild>
              <Button onClick={handleClick}>Create Entity Group</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
