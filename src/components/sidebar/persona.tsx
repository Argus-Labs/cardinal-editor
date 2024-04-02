import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
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
import { personaQueryOptions, receiptsQueryOptions, worldQueryOptions } from '@/lib/query-options'
import { sleep } from '@/lib/utils'

import { useToast } from '../ui/use-toast'

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
  const { cardinalUrl, isCardinalConnected, personas, setPersonas } = useCardinal()
  const { data } = useQuery(worldQueryOptions({ cardinalUrl, isCardinalConnected }))
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personaTag: '',
    },
  })
  const { toast } = useToast()

  const handleSubmit = async ({ personaTag }: z.infer<typeof formSchema>) => {
    const { privateKey, address, sign } = createPersonaAccount(personaTag)
    const { namespace } = data!
    const nonce = 0 // new accounts will always start with 0 as the nonce
    const message = `${personaTag}${namespace}${nonce}{"personaTag":"${personaTag}","signerAddress":"${address}"}`
    const signature = sign(message)
    const body = {
      personaTag,
      nonce,
      signature,
      namespace,
      body: { personaTag, signerAddress: address },
    }
    const res = await queryClient.fetchQuery(
      personaQueryOptions({ cardinalUrl, isCardinalConnected, body }),
    )

    // if we do it too fast the receipts could still be null
    await sleep(1000)

    const receiptBody = { startTick: res.Tick }
    const receipt = await queryClient.fetchQuery(
      receiptsQueryOptions({ cardinalUrl, isCardinalConnected, body: receiptBody }),
    )

    // TODO: verify this
    // we could just retry the query, however I couldn't get the receipt again after fetching
    // a null receipt. this might me a bug with cardinal, or a feature(?).
    if (!receipt.receipts) {
      toast({
        title: "Couldn't fetch receipt",
        description: "We couldn't verify whether the persona was successfully created or not",
      })
      return
    }

    const result = receipt.receipts[0]
    if (!result.result || !result.result.success) {
      const errors = result.errors?.join('\n')
      toast({
        title: 'Error creating persona',
        description: errors,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: `Successfully created persona ${personaTag}`,
    })

    // only set the personas if there is no error
    const newPersona = { personaTag, privateKey, address, nonce: nonce + 1 }
    setPersonas([...personas, newPersona])
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
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
        <Button className="w-full h-8 gap-1">
          {form.formState.isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
