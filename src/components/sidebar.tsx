import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BookDashed, MessageSquareCode, SearchCode, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPersonaAccount } from '@/lib/account'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { lastQueryOptions, personaQueryOptions, worldQueryOptions } from '@/lib/query-options'
import { WorldField } from '@/lib/types'


export function Sidebar() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { config, setConfig } = useConfig()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
  const queryClient = useQueryClient()
  const [personaError, setPersonaError] = useState('')

  // HACK: filter out messages/queries that don't use /{tx,query}/game/... endpoints
  // until we get the full endpoint from /debug/world or if we decided not to even
  // send them from the server.
  const builtin: any = {
    messages: {
      'create-persona': true,
      'authorize-persona-address': true,
    },
    queries: {
      signer: true,
      state: true,
      list: true,
    },
  }
  const sidebarItems = [
    {
      title: 'Messages',
      type: 'message',
      icon: <MessageSquareCode size={20} strokeWidth={2.1} />,
      items: data?.messages.filter((m) => !builtin.messages[m.name]) ?? [],
    },
    {
      title: 'Queries',
      type: 'query',
      icon: <SearchCode size={20} strokeWidth={2.1} />,
      items: data?.queries.filter((q) => !builtin.queries[q.name]) ?? [],
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // @ts-ignore
    const personaTag: string = e.target.persona.value
    if (!personaTag || personaTag.length < 3 || personaTag.length > 16 || !personaTag.match(/^[^\W]+$/)) {
      // TODO: more specific error messages
      setPersonaError('Invalid persona tag')
      return
    }
    const account = createPersonaAccount(personaTag)
    const { privateKey, address } = account
    // TODO: don't hardcode namespace, figure out how to get it from cardinal
    const namespace = 'world-1'
    const nonce = 0 // new accounts will always start with 0 as the nonce
    const message = `${personaTag}${namespace}${nonce}{"personaTag":"${personaTag}","signerAddress":"${address}"}`
    const signature = await account.sign(message)
    const body = {
      personaTag,
      namespace,
      nonce,
      signature,
      body: { personaTag, signerAddress: address },
    }
    // TODO: query error handling
    queryClient.fetchQuery(personaQueryOptions({ cardinalUrl, isCardinalConnected, body }))
    const newPersona = { personaTag, privateKey, address, nonce: nonce + 1 }
    setConfig({ ...config, personas: [...config.personas, newPersona] })
  }

  return (
    <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 border-r text-sm">
      <div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="create-persona" className="flex items-center gap-2 font-bold p-2">
            <UserPlus size={20} strokeWidth={2.1} />
            Create persona
          </label>
          <Input
            id="create-persona"
            name="persona"
            placeholder="PersonaTag"
            className="h-8"
            onChange={() => setPersonaError('')}
          />
          {personaError && <small className="text-xs text-destructive">{personaError}</small>}
          <Button className="h-8 w-full">Create</Button>
        </form>
        {sidebarItems.map((item, i) => (
          <SideBarItem key={i} item={item} />
        ))}
      </div>
      <ThemeToggle className="self-end" />
    </aside>
  )
}

interface SideBarItemProps {
  item: {
    title: string
    type: string
    icon: React.ReactNode
    items: WorldField[]
  }
}

function SideBarItem({ item }: SideBarItemProps) {
  return (
    <>
      <Accordion collapsible type="single" defaultValue="default">
        <AccordionItem value="default" className="border-0">
          <AccordionTrigger className="px-2">
            <p className="flex items-center gap-2 font-bold">
              {item.icon} {item.title}
            </p>
          </AccordionTrigger>
          <AccordionContent>
            {item.items.length === 0 ? (
              <div className="flex flex-col gap-4 items-center bg-muted text-muted-foreground py-4 rounded-lg">
                <BookDashed size={24} strokeWidth={2.5} />
                <div className="space-y-2 text-center">
                  <p className="text-xs font-semibold">No {item.title} Found</p>
                </div>
              </div>
            ) : (
              <Accordion collapsible type="single" className="space-y-2">
                {item.items.map((msgOrQry, i) => (
                  <MessageQueryAccordion key={i} type={item.type} msgOrQry={msgOrQry} />
                ))}
              </Accordion>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

interface MessageQueryAccordionProps {
  type: string
  msgOrQry: WorldField
}

// TODO: separate query & message components, factor sidebar items into separate files
function MessageQueryAccordion({ type, msgOrQry }: MessageQueryAccordionProps) {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const [fields, setFields] = useState<{ [param: string]: string }>(
    Object.keys(msgOrQry.fields).reduce((acc, i) => ({ ...acc, [i]: '' }), {}),
  )
  const queryClient = useQueryClient()

  const formatName = (name: string) => {
    let s = name.replace(/-/g, ' ')
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const handleClick = async () => {
    if (type === 'message') {
      alert("We don't support sending messages yet...")
      return
    }
    const ns = type === 'message' ? 'tx' : 'query'
    const base = {
      personaTag: 'CoolMage', // this is required!
      namespace: '',
      nonce: 0,
      signature: '',
    }
    const body = type === 'message' ? { ...base, body: fields } : fields
    queryClient.fetchQuery(
      lastQueryOptions({
        cardinalUrl,
        isCardinalConnected,
        ns,
        body,
        name: msgOrQry.name,
      }),
    )
  }

  return (
    <AccordionItem
      value={msgOrQry.name}
      className="bg-muted border border-border rounded-lg [&_.params]:data-[state=open]:hidden"
    >
      <AccordionTrigger
        title={formatName(msgOrQry.name)}
        className="p-2 max-w-full rounded-lg border-border data-[state=closed]:border-b data-[state=closed]:bg-background"
      >
        <p className="text-sm text-left max-w-[85%] truncate">{formatName(msgOrQry.name)}</p>
      </AccordionTrigger>
      <div className="params px-2 py-0.5 font-medium text-xs text-muted-foreground truncate">
        {Object.keys(msgOrQry.fields).join(', ')}
      </div>
      <AccordionContent className="p-2 space-y-2">
        {Object.keys(msgOrQry.fields).map((param) => (
          <div key={param} className="space-y-1">
            <p className="font-medium space-x-2">
              <label htmlFor={msgOrQry.name}>{param}</label>
              <span className="text-muted-foreground font-normal">{msgOrQry.fields[param]}</span>
            </p>
            <Input
              id={msgOrQry.name}
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
