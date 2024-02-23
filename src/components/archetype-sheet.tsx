import { useState } from 'react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MultiSelect } from '@/components/multi-select';

export function ArchetypeSheet() {
  const [components, setComponents] = useState<string[]>([])
  const options = [{ value: 'player', label: 'Player' }, { value: 'health', label: 'Health' }]

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
                className="bg-muted border border-border rounded-lg px-3 py-1"
              >
                <AccordionItem value="default" className="border-0 space-y-2">
                  <AccordionTrigger className="py-2 text-sm">Sample entities</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">No components selected...</p>
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
