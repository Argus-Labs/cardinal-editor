import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { toast as toastfn } from '@/components/ui/use-toast'

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
