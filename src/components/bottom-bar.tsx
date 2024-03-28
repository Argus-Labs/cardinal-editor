import { useQuery } from '@tanstack/react-query'
import { Braces, ChevronsDown, ChevronsUp, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'

import { Button } from '@/components/ui/button'
import { ResizablePanel } from '@/components/ui/resizable'

export function BottomBar() {
  const ref = useRef<ImperativePanelHandle>(null)
  const [collapsed, setCollapsed] = useState(true)
  const { data, isError, error } = useQuery({ queryKey: ['game'], enabled: false })

  useEffect(() => {
    const panel = ref.current
    if (panel && (data || error)) {
      panel.resize(30)
    }
  }, [data, error])

  const handleExpand = () => {
    const panel = ref.current
    if (panel) {
      setCollapsed(panel.getSize() <= 3)
    }
  }
  const expandBottomBar = () => {
    const panel = ref.current
    if (panel) {
      panel.resize(panel.getSize() > 3 ? 3 : 65)
    }
  }

  return (
    <ResizablePanel
      ref={ref}
      defaultSize={3}
      minSize={3}
      maxSize={65}
      onResize={handleExpand}
      className="p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">Results</p>
        <Button variant="outline" size="icon" className="size-8" onClick={expandBottomBar}>
          {collapsed ? <ChevronsUp size={20} /> : <ChevronsDown size={20} />}
        </Button>
      </div>
      <div className="h-[calc(100%-4rem)] overflow-y-auto bg-muted px-3 py-1 rounder border border-border">
        {isError ? (
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <XCircle size={36} strokeWidth={2.5} className="text-muted-foreground flex-shrink-0" />
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-sm">
                Error fetching data.
                <br />
                {error.message}
              </p>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <Braces size={36} strokeWidth={2.5} className="text-muted-foreground flex-shrink-0" />
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-sm">
                No results.
                <br />
                You can send messages and queries from the sidebar.
              </p>
            </div>
          </div>
        ) : (
          <div className="font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}
