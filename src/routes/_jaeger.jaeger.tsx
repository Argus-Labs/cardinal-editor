import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { routeJaegerServices } from '@/lib/query-options'
import { errorToast } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Clipboard, Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/_jaeger/jaeger')({
  component: Jaeger,
})

const responseSchema = z.object({
  data: z.string().array(),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  errors: z.string().array().nullable(),
})

function Jaeger() {
  const { jaegerUrl } = useCardinal()
  const { data: url } = useQuery({ queryKey: ['jaegerSearch'], enabled: false })
  const [isJaegerRunning, setIsJaegerRunning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const ping = async () => {
      try {
        // checking /api/services is more accurate than checking the root / route
        const res = await fetch(jaegerUrl + routeJaegerServices)
        if (!res.ok) {
          const error = await res.text()
          throw error
        }
        const body = await res.json()
        const parsed = responseSchema.safeParse(body)
        // this means jaegerUrl isn't pointing to a proper jaeger service
        if (!parsed.success) {
          throw new Error('Invalid Jaeger Services API')
        }
        setIsJaegerRunning(true)
      } catch (error) {
        setIsJaegerRunning(false)
        errorToast(toast, new Error('Cannot connect to Jaeger service'), 'Error fetching Jaeger')
        console.log(error)
      }
    }
    ping().then()
  }, [jaegerUrl, toast])

  const defaultUrl = `${jaegerUrl}/?uiEmbed=v0`
  const telemetryCommand = 'world cardinal start --telemetry'

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(telemetryCommand).then(() =>
      toast({
        title: 'Copied to clipboard',
      }),
    )
  }

  return (
    <>
      {!isJaegerRunning ? (
        <div className="flex flex-col gap-4 items-center h-full pt-[21.5rem]">
          <Unlink size={40} strokeWidth={2.5} className="text-muted-foreground" />
          <div className="flex flex-col items-center gap-2 max-w-md">
            <p className="text-lg font-semibold">Not Connected</p>
            <p className="text-muted-foreground">
              To enable Jaeger, set{' '}
              <code className="text-sm font-bold">NAKAMA_TRACE_ENABLED=true</code>, in your{' '}
              <code className="text-sm font-bold">world.toml</code> file and run this command:
            </p>
            <pre className="flex items-center justify-between gap-2 w-full px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground dark:bg-primary-foreground dark:text-primary">
              <code>
                <code className="select-none text-green-400">$ </code>
                {telemetryCommand}
              </code>
              <Button variant="ghost" size="icon" className="dark" onClick={handleCopyToClipboard}>
                <Clipboard size={17} />
              </Button>
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-white h-full border border-border rounded-md">
          <iframe
            src={url && typeof url === 'string' ? url : defaultUrl}
            className="w-full h-full"
          />
        </div>
      )}
    </>
  )
}
