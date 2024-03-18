import { useQueryClient } from '@tanstack/react-query'
import { BookDashed, SearchCode } from 'lucide-react'
import { useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCardinal } from '@/lib/cardinal-provider'
import { lastQueryQueryOptions } from '@/lib/query-options'
import { WorldField } from '@/lib/types'

import { formatName } from './utils'

interface SidebarQueriesProps {
  queries: WorldField[]
}

export function SidebarQueries({ queries }: SidebarQueriesProps) {
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
  const [fields, setFields] = useState<{ [param: string]: string }>(
    Object.keys(query.fields).reduce((acc, i) => ({ ...acc, [i]: '' }), {}),
  )

  const handleClick = async () => {
    queryClient.fetchQuery(
      lastQueryQueryOptions({
        cardinalUrl,
        isCardinalConnected,
        name: query.name,
        body: fields,
      }),
    )
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
      <AccordionContent className="p-2 space-y-2">
        {Object.keys(query.fields).map((param) => (
          <div key={param} className="space-y-1">
            <p className="font-medium space-x-2">
              <label htmlFor={query.name}>{param}</label>
              <span className="text-muted-foreground font-normal">{query.fields[param]}</span>
            </p>
            <Input
              id={query.name}
              value={fields[param]}
              onChange={(e) => setFields({ ...fields, [param]: e.target.value })}
              className="h-8"
            />
          </div>
        ))}
        <Button onClick={handleClick} className="w-full h-8">
          Send
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}
