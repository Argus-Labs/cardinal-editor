import { EntityCard } from '@/components/entity-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardinal } from '@/lib/cardinal-provider';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { LayoutGrid, List } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { cardinalUrl } = useCardinal()
  const { data: entities } = useQuery({
    queryKey: ['state'],
    queryFn: async () => {
      const res = await fetch(`${cardinalUrl}/debug/state`)
      return await res.json()
    },
    refetchInterval: 1000,
  })

  return (
    <>
      <Tabs defaultValue="card" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Entities</h1>
          <div className="flex items-center gap-4">
            <TabsList className="bg-background border">
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
          <div className="grid grid-cols-4 gap-4">
            {entities?.map((entity: any) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          in construction...
        </TabsContent>
      </Tabs>
    </>
  )
}
