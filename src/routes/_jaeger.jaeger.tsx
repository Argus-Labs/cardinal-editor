import { useCardinal } from '@/lib/cardinal-provider'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_jaeger/jaeger')({
  component: Jaeger,
})

function Jaeger() {
  const { jaegerUrl } = useCardinal()
  const { data: url } = useQuery({ queryKey: ['jaegerSearch'], enabled: false })
  const [isJaegerRunning, setIsJaegerRunning] = useState(false)

  useEffect(() => {
    const ping = async () => {
      const res = await fetch(jaegerUrl)
      setIsJaegerRunning(res.ok)
    }
    ping().then()
  }, [jaegerUrl])

  const defaultUrl = `${jaegerUrl}/?uiEmbed=v0`

  return (
    <>
      {!isJaegerRunning ? (
        <div className="flex flex-col gap-4 items-center h-full pt-[21.5rem]">
          <Unlink size={40} strokeWidth={2.5} className="text-muted-foreground" />
          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold">Not Connected</p>
            <p className="text-muted-foreground">Make sure you have a running Jaeger instance!</p>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-white h-full border border-border rounded-md">
          <iframe src={(url as string) ?? defaultUrl} className="w-full h-full" />
        </div>
      )}
    </>
  )
}
