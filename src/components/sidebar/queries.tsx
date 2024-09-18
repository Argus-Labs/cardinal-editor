import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { BookDashed, Loader, SearchCode } from 'lucide-react'
import { useForm } from 'react-hook-form'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { gameQueryQueryOptions, routeCql } from '@/lib/query-options'
import { ComponentProperty, WorldField } from '@/lib/types'
import { errorToast } from '@/lib/utils'

import { defaultValues, formSchema, formatName, goTypeToInputComponent } from './utils'

interface SidebarQueriesProps {
  queries: WorldField[]
}

export function SidebarQueries({ queries }: SidebarQueriesProps) {
  const cql: WorldField = {
    name: 'CQL',
    fields: {
      CQL: 'string',
    },
    url: routeCql,
  }
  queries = [...queries, cql]

  return (
    <Accordion collapsible type="single" defaultValue="default">
      <AccordionItem value="default" className="border-0">
        <AccordionTrigger className="px-2">
          <p className="flex items-center gap-2 font-bold">
            <SearchCode size={20} strokeWidth={2.1} />
            Queries
          </p>
        </AccordionTrigger>
        <AccordionContent>
          {queries.length === 0 ? (
            <div className="flex flex-col gap-4 items-center bg-muted text-muted-foreground py-4 rounded-lg">
              <BookDashed size={24} strokeWidth={2.5} />
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold">No Queries Found</p>
              </div>
            </div>
          ) : (
            <Accordion collapsible type="single" className="space-y-2">
              {queries.map((q, i) => (
                <Query key={i} query={q} />
              ))}
            </Accordion>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface QueryProp {
  query: WorldField
}

function Query({ query }: QueryProp) {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const queryClient = useQueryClient()
  const form = useForm({
    resolver: zodResolver(formSchema(query)),
    defaultValues: defaultValues(query),
  })
  const { toast } = useToast()

  const handleSubmit = (values: ComponentProperty) => {
    queryClient
      .fetchQuery(
        gameQueryQueryOptions({
          cardinalUrl,
          isCardinalConnected,
          url: query.url,
          body: values,
        }),
      )
      .then(() => true)
      .catch((error) => errorToast(toast, error, 'Error sending query'))
  }

  return (
    <AccordionItem
      value={query.name}
      className="bg-muted border border-border rounded-lg [&_.params]:data-[state=open]:hidden"
    >
      <AccordionTrigger
        title={formatName(query.name)}
        className="p-2 max-w-full rounded-lg border-border data-[state=closed]:border-b data-[state=closed]:bg-background"
      >
        <p className="text-sm text-left max-w-[85%] truncate">{formatName(query.name)}</p>
      </AccordionTrigger>
      <div className="params px-2 py-0.5 font-medium text-xs text-muted-foreground truncate">
        {Object.keys(query.fields).join(', ')}
      </div>
      <AccordionContent>
        <Form {...form}>
          {/* src: https://github.com/orgs/react-hook-form/discussions/8622 */}
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="p-2 space-y-2">
            {Object.keys(query.fields).map((param) => (
              <FormField
                key={param}
                control={form.control}
                name={param}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-medium space-x-2">
                      <span>{param}</span>
                      <span className="text-muted-foreground font-normal">
                        {query.fields[param]}
                      </span>
                    </FormLabel>
                    <FormControl>{goTypeToInputComponent(query.fields[param], field)}</FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button className="w-full h-8 gap-1">
              {form.formState.isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Send'}
            </Button>
          </form>
        </Form>
      </AccordionContent>
    </AccordionItem>
  )
}
