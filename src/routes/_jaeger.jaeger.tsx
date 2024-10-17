import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Clipboard, Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_jaeger/jaeger')({
  component: Jaeger,
})

function Jaeger() {
  const { jaegerUrl } = useCardinal()
  const { data: url } = useQuery({ queryKey: ['jaegerSearch'], enabled: false })
  const [isJaegerRunning, setIsJaegerRunning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch(jaegerUrl)
        setIsJaegerRunning(res.ok)
      } catch (_error) {
        // no need to do anything as isJaegerRunning false by default
      }
    }
    ping().then()
  }, [jaegerUrl])

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
