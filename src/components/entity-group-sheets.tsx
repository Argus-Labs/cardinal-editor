import { useQuery } from '@tanstack/react-query'
import { Edit } from 'lucide-react'
import { useState } from 'react'

import { EntityCard } from '@/components/entity-views'
import { MultiSelect } from '@/components/multi-select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { worldQueryOptions } from '@/lib/query-options'
import { Entity, WorldField } from '@/lib/types'

const sampleEntity = (selected: string[], components: WorldField[]): Entity => {
  const componentsMap: { [key: string]: string } = components.reduce((acc, c) => ({ ...acc, [c.name]: c.fields }), {})
  return {
    id: 0,
    components: selected.reduce((acc, c) => ({ ...acc, [c]: componentsMap[c] }), {}),
  }
}

// TODO: consider zod for form validation
export function NewEntityGroupSheet() {
  const cardinal = useCardinal()
  const { data } = useQuery(worldQueryOptions(cardinal))
  const { config, setConfig } = useConfig()
  const { toast } = useToast()
  const [entityGroupName, setEntityGroupName] = useState('')
  const [entityGroupError, setEntityGroupError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [selectedError, setSelectedError] = useState('')

  const components = data?.components ?? []
  const options = components.map((c) => ({ label: c.name, value: c.name })) ?? []
  const hasSelectedComponents = selected && selected.length > 0
  const accordionValue = hasSelectedComponents ? 'default' : ''

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
    if (config.entityGroups.filter((eg) => eg.name === entityGroupName).length > 0) {
      e.preventDefault()
      setSelectedError(`"${entityGroupName}" already exists, please use a different name`)
      return
    }
    const newEntityGroup = {
      name: entityGroupName,
      components: selected,
    }
    setConfig({ ...config, entityGroups: [...config.entityGroups, newEntityGroup] })
    toast({
      title: 'Successfully created entity group',
    })
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
                <MultiSelect options={options} selected={selected} onChange={setSelected} />
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
                    {hasSelectedComponents && <EntityCard entity={sampleEntity(selected, components)} />}
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

interface EditEntityGroupProps {
  entityGroup: {
    name: string
    components: string[]
  }
}

export function EditEntityGroupSheet({ entityGroup }: EditEntityGroupProps) {
  const cardinal = useCardinal()
  const { data } = useQuery(worldQueryOptions(cardinal))
  const { config, setConfig } = useConfig()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [entityGroupName, setEntityGroupName] = useState(entityGroup.name)
  const [entityGroupError, setEntityGroupError] = useState('')
  const [selected, setSelected] = useState<string[]>(entityGroup.components)
  const [selectedError, setSelectedError] = useState('')

  const components = data?.components ?? []
  const options = components.map((c) => ({ label: c.name, value: c.name })) ?? []
  const hasSelectedComponents = selected && selected.length > 0
  const accordionValue = hasSelectedComponents ? 'default' : ''

  const handleEdit = (e: React.MouseEvent<HTMLElement>) => {
    if (entityGroupName.length === 0) {
      e.preventDefault()
      setEntityGroupError('Please enter a name for the entity group')
    }
    if (selected.length === 0) {
      e.preventDefault()
      setSelectedError('Please select at least 1 component')
      return
    }
    if (config.entityGroups.filter((eg) => eg.name === entityGroupName).length > 0) {
      e.preventDefault()
      setSelectedError(`"${entityGroupName}" already exists, please use a different name`)
      return
    }
    const newEntityGroups = config.entityGroups.map((eg) => {
      if (eg.name !== entityGroup.name) return eg
      return {
        name: entityGroupName,
        components: selected,
      }
    })
    setConfig({ ...config, entityGroups: newEntityGroups })
    toast({
      title: 'Successfully updated entity group',
    })
  }
  const handleDelete = () => {
    const newEntityGroups = config.entityGroups.filter((eg) => eg.name !== entityGroupName)
    setConfig({ ...config, entityGroups: newEntityGroups })
    setOpen(false)
    toast({
      title: 'Successfully deleted entity group',
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <Edit size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle>Edit Entity Group</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Entity group name</Label>
                <Input
                  required
                  value={entityGroupName}
                  onChange={(e) => setEntityGroupName(e.target.value)}
                  placeholder="Entity group name..."
                />
                <small className="text-destructive">{entityGroupError}</small>
              </div>
              <div className="space-y-1">
                <Label>Components</Label>
                <MultiSelect options={options} selected={selected} onChange={setSelected} />
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
                    {hasSelectedComponents && <EntityCard entity={sampleEntity(selected, components)} />}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <SheetFooter className="mt-auto">
            <SheetClose asChild>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Entity Group?</DialogTitle>
                    <DialogDescription>
                      Are you sure want to delete this entity group?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={handleEdit}>Save Changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
