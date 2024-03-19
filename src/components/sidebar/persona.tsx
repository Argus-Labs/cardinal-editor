import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { createPersonaAccount } from '@/lib/account'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { personaQueryOptions } from '@/lib/query-options'

const formSchema = z.object({
  personaTag: z
    .string()
    .trim()
    .min(3, {
      message: 'Persona tag must be at least 3 characters',
    })
    .max(16, {
      message: 'Persona tag must be 16 characters or less',
    })
    .regex(/^[^\W]+$/, {
      message: 'Persona tag must contain only alphanumeric characters and underscores',
    }),
})

export function CreatePersona() {
  const { config, setConfig } = useConfig()
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const handleSubmit = async ({ personaTag }: z.infer<typeof formSchema>) => {
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 bg-muted border border-border rounded-lg p-2"
      >
        <FormField
          control={form.control}
          name="personaTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Create persona</FormLabel>
              <FormControl>
                <Input required placeholder="PersonaTag" className="h-8" {...field} />
              </FormControl>
              <FormMessage className="text-xs break-words" />
            </FormItem>
          )}
        />
        <Button className="h-8 w-full">Create</Button>
      </form>
    </Form>
  )
}
