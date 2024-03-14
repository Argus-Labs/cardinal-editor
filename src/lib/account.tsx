import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { keccak256, toHex } from 'viem/utils'

import { sign } from '../../node_modules/viem/accounts/utils/sign'
import { signatureToHex } from '../../node_modules/viem/utils/signature/signatureToHex'

// we need this because world-engine doesn't follow any signing formats, e.g. eip-191 or eip-712.
// the plan is to use eip-712, (viem's signTypedData), but until that's implemented, we'll be using this
async function customSign(msg: string, privateKey: `0x${string}`) {
  const signature = await sign({ hash: keccak256(toHex(msg)), privateKey })
  return signatureToHex(signature)
}

export const createPersonaAccount = (personaTag: string) => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)

  return {
    personaTag,
    privateKey,
    address,
    sign: async (msg: string) => {
      const signature = await customSign(msg, privateKey)
      return signature.slice(2) // remove `0x` from hex string
    },
  }
}
