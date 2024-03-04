import { useEffect, useRef, useState } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { ResizablePanel } from './ui/resizable';
import { Button } from './ui/button';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function BottomBar() {
  const ref = useRef<ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = useState(true)
  const { data } = useQuery({ queryKey: ['last-query'], initialData: null })

  useEffect(() => {
    const panel = ref.current
    if (data && panel) {
      panel.resize(65)
    }
  }, [data])

  const handleExpand = () => {
    const panel = ref.current
    if (panel) {
      setCollapsed(!(panel.getSize() >= 65))
    }
  }
  const expandBottomBar = () => {
    const panel = ref.current
    if (panel) {
      panel.resize(panel.getSize() >= 65 ? 3 : 65)
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
      <div className="max-h-[calc(100%-4rem)] overflow-y-auto bg-muted px-3 py-1 rounder border border-border">
        {data && (
          <div className="font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}
