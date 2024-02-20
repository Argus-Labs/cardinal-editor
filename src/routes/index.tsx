import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { LayoutGrid, List } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <Tabs defaultValue="card">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Entities</h1>
          <div className="flex items-center gap-4">
            <TabsList className="bg-background ">
              <TabsTrigger value="card" className="data-[state=active]:bg-muted px-2">
                <LayoutGrid size={20} />
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-muted px-2">
                <List size={20} />
              </TabsTrigger>
            </TabsList>
            <Button>New archetype</Button>
          </div>
        </div>
        <TabsContent value="card">
          entities displayed in card view
        </TabsContent>
        <TabsContent value="list">
          entities displayed in list view
        </TabsContent>
      </Tabs>
    </>
  )
}
