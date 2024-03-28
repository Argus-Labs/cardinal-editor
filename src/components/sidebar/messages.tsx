import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BookDashed, MessageSquareCode } from 'lucide-react'
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
import { gameMessageQueryOptions, worldQueryOptions } from '@/lib/query-options'
import { WorldField } from '@/lib/types'

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
  const { cardinalUrl, isCardinalConnected, personas, setPersonas } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
  const queryClient = useQueryClient()
  const form = useForm()

  // @ts-ignore
  const handleSubmit = async (values) => {
    const { persona: personaTag, ...fields } = values as { [k: string]: string }
    const persona = personas.filter((p) => p.personaTag === personaTag)[0]
    const { sign } = accountFromPersona(persona)
    const { namespace } = data!
    const msg = `${personaTag}${namespace}${persona.nonce}${JSON.stringify(fields)}`
    const signature = sign(msg)
    const body = {
      personaTag,
      signature,
      namespace,
      nonce: persona.nonce,
      body: fields,
    }
    await queryClient.fetchQuery(
      gameMessageQueryOptions({
        cardinalUrl,
        isCardinalConnected,
        url: message.url,
        body,
      }),
    )
    // increment nonce for the persona that submitted the message
    setPersonas(
      personas.map((p) => {
        return p.personaTag === personaTag ? { ...p, nonce: p.nonce + 1 } : p
      }),
    )
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
      <AccordionContent>
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="p-2 space-y-2">
            <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Persona tag</FormLabel>
                  <Select
                    required
                    disabled={personas.length === 0}
                    defaultValue={field.value as string}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue
                          placeholder={
                            personas.length === 0 ? 'No personas found' : 'Select persona'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personas.map(({ personaTag }) => (
                        <SelectItem key={personaTag} value={personaTag}>
                          {personaTag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {Object.keys(message.fields).map((param) => (
              <FormField
                key={param}
                control={form.control}
                name={param}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-medium space-x-2">
                      <span>{param}</span>
                      <span className="text-muted-foreground font-normal">
                        {message.fields[param]}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input required className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button className="w-full h-8">Send</Button>
          </form>
        </Form>
      </AccordionContent>
    </AccordionItem>
  )
}
