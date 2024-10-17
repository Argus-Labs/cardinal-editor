import { useCardinal } from '@/lib/cardinal-provider'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_jaeger/jaeger')({
  component: Jaeger,
})

function Jaeger() {
  const { jaegerUrl } = useCardinal()
  const { data: url } = useQuery({ queryKey: ['jaegerSearch'], enabled: false })
  const defaultUrl = `${jaegerUrl}/?uiEmbed=v0`

  return (
    <div className="p-2 bg-white h-full border border-border rounded-md">
      <iframe src={(url as string) ?? defaultUrl} className="w-full h-full" />
    </div>
  )
}
