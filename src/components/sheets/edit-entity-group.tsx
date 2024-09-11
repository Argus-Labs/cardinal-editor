import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Edit, X } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { worldQueryOptions } from '@/lib/query-options'

import { SampleEntities } from './sample-entities'

const formSchema = z.object({
  name: z.string().min(3).max(64),
  components: z
    .string()
    .array()
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one component.',
    }),
})

interface EditEntityGroupProps {
  entityGroup: {
    name: string
    components: string[]
  }
}

export function EditEntityGroupSheet({ entityGroup }: EditEntityGroupProps) {
  const { cardinalUrl, isCardinalConnected, entityGroups, setEntityGroups } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: entityGroup,
  })
  const [open, setOpen] = useState(false)
  const posthog = usePostHog()

  const originalName = entityGroup.name
  const components = data?.components ?? []
  const options = components.map((c) => ({ label: c.name, value: c.name })) ?? []
  const selected = form.watch('components')

  const handleUnselect = (item: string) => {
    form.setValue(
      'components',
      selected.filter((c) => c !== item),
    )
  }
  const handleEdit = (values: z.infer<typeof formSchema>) => {
    const newEntityGroups = entityGroups.map((eg) =>
      eg.name === originalName ? { ...values } : eg,
    )
    setEntityGroups(newEntityGroups)
    form.reset()
    setOpen(false)
    toast({
      title: 'Successfully updated entity group',
    })
    const fieldsUpdated = Object.keys(entityGroup).filter((k) => {
      const key = k as 'name' | 'components'
      return entityGroup[key] !== values[key]
    })
    posthog.capture('Entity Group Edited', {
      fieldsUpdated: fieldsUpdated,
    })
  }
  const handleDelete = () => {
    const newEntityGroups = entityGroups.filter((eg) => eg.name !== originalName)
    setEntityGroups(newEntityGroups)
    setOpen(false)
    toast({
      title: 'Successfully deleted entity group',
    })
    posthog.capture('Entity Group Deleted', {
      componentsCount: entityGroup.components.length,
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Edit size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(handleEdit)(e)}
            className="h-full flex flex-col justify-between"
          >
            <div>
              <SheetHeader>
                <SheetTitle>Edit Entity Group</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Entity group name</FormLabel>
                      <FormControl>
                        <Input required placeholder="Entity group name" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="components"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Components</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              Select components
                              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-80">
                            {options.map((o) => (
                              <FormItem key={o.value}>
                                <DropdownMenuCheckboxItem
                                  checked={field.value?.includes(o.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, o.value])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== o.value),
                                        )
                                  }}
                                >
                                  {o.label}
                                </DropdownMenuCheckboxItem>
                              </FormItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <div className="flex gap-1 flex-wrap h-10 px-3 py-2 border border-border rounded-lg mt-2">
                        {selected.map((item) => (
                          <Badge key={item} onClick={() => handleUnselect(item)}>
                            {item}
                            <button
                              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUnselect(item)
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={() => handleUnselect(item)}
                            >
                              <X className="size-3.5 text-primary-foreground" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <SampleEntities selected={selected} components={components} />
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
              <Button>Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
