import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { toast as toastfn } from '@/components/ui/use-toast'

import { Entity, UnPatchedEntity, WorldField } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sleep = async (duration: number) => await new Promise((r) => setTimeout(r, duration))

type ToastFn = typeof toastfn

export const errorToast = (toast: ToastFn, error: unknown, title: string) => {
  // we can't just pass error to description as it's type is Object. as error is of type unknown,
  // we need to let typescript know that it is an Error so that we can access the meessage
  // property without type errors
  if (error instanceof Error) {
    toast({
      title,
      description: error.message,
      variant: 'destructive',
    })
  } else {
    console.log(error)
  }
}

// this is a patch to make the editor compatible with cardinal versions v1.3.3 -> v1.4.0
// the break happened in https://github.com/Argus-Labs/world-engine/pull/762, where the
// /debug/state payload was reverted back to when the cardinal editor doesn't exist
//
// this function "optimistically" converts the old payload into the current one used by
// the editor, e.g. in cardinal v1.3.2.
export const patchEntities = (entities: UnPatchedEntity[], components: WorldField[]): Entity[] => {
  const componentsMap: { [component: string]: string } = components.reduce(
    (acc, c) => ({ ...acc, [c.name]: JSON.stringify(Object.keys(c.fields).toSorted()) }),
    {},
  )
  return entities.map((e) => {
    const guess = e.data.map((c) => {
      const fields = JSON.stringify(Object.keys(c).toSorted())
      const component = Object.keys(componentsMap).filter((f) => componentsMap[f] === fields)[0]
      return component
    })
    return {
      id: e.id,
      components: guess.reduce((acc, c, i) => {
        return { ...acc, [c]: e.data[i] }
      }, {}),
    }
  })
}
