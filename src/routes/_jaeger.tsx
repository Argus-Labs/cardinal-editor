import { JaegerSidebar } from '@/components/jaeger/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_jaeger')({
  component: JaegerLayout,
})

function JaegerLayout() {
  return (
    <main className="flex h-[calc(100%-3rem-1px)]">
      <JaegerSidebar />
      <div className="w-full h-full">
        <div className="bg-muted h-full p-3 overflow-y-auto">
          <Outlet />
        </div>
        <Toaster />
      </div>
    </main>
  )
}
