import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  SheetContent,
  SheetDescription,
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

export function NewEntityGroupSheet() {
  const { cardinalUrl, isCardinalConnected, entityGroups, setEntityGroups } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      components: [],
    },
  })
  const [open, setOpen] = useState(false)

  const components = data?.components ?? []
  const options = components.map((c) => ({ label: c.name, value: c.name })) ?? []
  const selected = form.watch('components')

  const handleUnselect = (item: string) => {
    form.setValue(
      'components',
      selected.filter((c) => c !== item),
    )
  }
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (entityGroups.filter((eg) => eg.name === values.name).length > 0) {
      form.setError('name', {
        type: 'custom',
        message: `"${values.name}" already exists, please use a different name`,
      })
      return
    }
    setEntityGroups([...entityGroups, values])
    form.reset()
    setOpen(false)
    toast({
      title: 'Successfully created entity group',
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>New Entity Group</Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
            className="h-full flex flex-col justify-between"
          >
            <div>
              <SheetHeader>
                <SheetTitle>New Entity Group</SheetTitle>
                <SheetDescription>
                  You can create "entity groups" by grouping different components. It acts as a
                  filter to only show entities containing the components you specify.
                </SheetDescription>
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
              <Button>Create Entity Group</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
