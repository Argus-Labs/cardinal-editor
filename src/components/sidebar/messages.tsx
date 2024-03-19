import { useQueryClient } from '@tanstack/react-query'
import { BookDashed, MessageSquareCode } from 'lucide-react'
import { useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { accountFromPersona } from '@/lib/account'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { lastMessageQueryOptions } from '@/lib/query-options'
import { WorldField } from '@/lib/types'
import { Persona } from '@/lib/types'

import { formatName } from './utils'

interface SidebarMessagesProps {
  messages: WorldField[]
}

export function SidebarMessages({ messages }: SidebarMessagesProps) {
  return (
    <Accordion collapsible type="single" defaultValue="default">
      <AccordionItem value="default" className="border-0">
        <AccordionTrigger className="px-2">
          <p className="flex items-center gap-2 font-bold">
            <MessageSquareCode size={20} strokeWidth={2.1} />
            Messages
          </p>
        </AccordionTrigger>
        <AccordionContent>
          {messages.length === 0 ? (
            <div className="flex flex-col gap-4 items-center bg-muted text-muted-foreground py-4 rounded-lg">
              <BookDashed size={24} strokeWidth={2.5} />
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold">No Messages Found</p>
              </div>
            </div>
          ) : (
            <Accordion collapsible type="single" className="space-y-2">
              {messages.map((m, i) => (
                <Message key={i} message={m} />
              ))}
            </Accordion>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface MessageProp {
  message: WorldField
}

function Message({ message }: MessageProp) {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const queryClient = useQueryClient()
  const { config, setConfig } = useConfig()
  const [persona, setPersona] = useState<Persona>()
  const [fields, setFields] = useState<{ [param: string]: string }>(
    Object.keys(message.fields).reduce((acc, i) => ({ ...acc, [i]: '' }), {}),
  )

  const handleValueChange = (value: string) => {
    const persona = config.personas.filter((p) => p.personaTag === value)[0]
    setPersona(persona)
  }

  const handleClick = async () => {
    if (!persona) return
    const account = accountFromPersona(persona)
    const { personaTag, nonce } = persona
    const namespace = 'world-1'
    const msg = `${personaTag}${namespace}${nonce}${JSON.stringify(fields)}`
    const signature = await account.sign(msg)
    const body = {
      personaTag,
      namespace,
      nonce,
      signature,
      body: fields,
    }
    queryClient.fetchQuery(
      lastMessageQueryOptions({
        cardinalUrl,
        isCardinalConnected,
        name: message.name,
        body,
      }),
    )
    setConfig({
      ...config,
      personas: config.personas.map((p) => {
        return p.personaTag === personaTag ? { ...p, nonce: p.nonce + 1 } : p
      }),
    })
    // this is needed if user doesn't switch personas
    setPersona({ ...persona, nonce: nonce + 1 })
  }

  return (
    <AccordionItem
      value={message.name}
      className="bg-muted border border-border rounded-lg [&_.params]:data-[state=open]:hidden"
    >
      <AccordionTrigger
        title={formatName(message.name)}
        className="p-2 max-w-full rounded-lg border-border data-[state=closed]:border-b data-[state=closed]:bg-background"
      >
        <p className="text-sm text-left max-w-[85%] truncate">{formatName(message.name)}</p>
      </AccordionTrigger>
      <div className="params px-2 py-0.5 font-medium text-xs text-muted-foreground truncate">
        {Object.keys(message.fields).join(', ')}
      </div>
      <AccordionContent className="p-2 space-y-2">
        <Select required disabled={config.personas.length === 0} onValueChange={handleValueChange}>
          <SelectTrigger className="h-8">
            <SelectValue
              placeholder={config.personas.length === 0 ? 'No personas found' : 'Select persona'}
            />
          </SelectTrigger>
          <SelectContent>
            {config.personas.map(({ personaTag }) => (
              <SelectItem key={personaTag} value={personaTag}>
                {personaTag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {Object.keys(message.fields).map((param) => (
          <div key={param} className="space-y-1">
            <p className="font-medium space-x-2">
              <label htmlFor={message.name}>{param}</label>
              <span className="text-muted-foreground font-normal">{message.fields[param]}</span>
            </p>
            <Input
              id={message.name}
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
