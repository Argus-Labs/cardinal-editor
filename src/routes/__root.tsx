import { createRootRoute, Outlet } from '@tanstack/react-router'

import { BottomBar } from '@/components/bottom-bar'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/toaster'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100%-3rem-1px)]">
        <Sidebar />
        <div className="w-full">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <div className="bg-muted h-full px-4 pt-4 pb-16 overflow-y-auto">
                <Outlet />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <BottomBar />
          </ResizablePanelGroup>
        </div>
      </main>
      <Toaster />
    </>
  )
}
