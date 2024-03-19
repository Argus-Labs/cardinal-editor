import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPersonaAccount } from '@/lib/account'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { personaQueryOptions } from '@/lib/query-options'

export function CreatePersona() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const queryClient = useQueryClient()
  const { config, setConfig } = useConfig()
  const [personaTag, setPersonaTag] = useState('')
  const [personaTagError, setPersonaTagError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonaTag(e.target.value)
    setPersonaTagError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !personaTag ||
      personaTag.length < 3 ||
      personaTag.length > 16 ||
      !personaTag.match(/^[^\W]+$/)
    ) {
      // TODO: more specific error messages
      setPersonaTagError('Invalid persona tag')
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
    setPersonaTag('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 bg-muted border border-border rounded-lg p-2"
    >
      <label htmlFor="create-persona" className="font-medium">
        Create persona
      </label>
      <Input
        id="create-persona"
        name="persona"
        placeholder="PersonaTag"
        className="h-8"
        value={personaTag}
        onChange={handleChange}
      />
      {personaTagError && <small className="text-xs text-destructive">{personaTagError}</small>}
      <Button className="h-8 w-full">Create</Button>
    </form>
  )
}
