import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Box, LayoutGrid, List, Unlink } from 'lucide-react';

import { EntityCards, EntityList } from '@/components/entity-views';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardinal } from '@/lib/cardinal-provider';
import { useConfig } from '@/lib/config-provider';
import { ArchetypeSheet } from '@/components/archetype-sheet';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { data: entities } = useQuery({
    queryKey: ['state'],
    queryFn: async () => {
      const res = await fetch(`${cardinalUrl}/query/debug/state`, {
        method: 'POST',
        body: '{}'
      })
      return await res.json()
    },
    refetchInterval: 1000,
    enabled: isCardinalConnected,
  })
  const { config, setConfig } = useConfig()
  const hasNoEntities = !(entities && entities.length > 0)

  const handleTabSwitch = (view: string) => {
    setConfig({ ...config, view })
  }

  return (
    <>
      <Tabs defaultValue={config.view} onValueChange={handleTabSwitch} className="space-y-6">
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
            <ArchetypeSheet />
          </div>
        </div>
        {!isCardinalConnected ? (
          <div className="flex flex-col gap-4 items-center pt-72">
            <Unlink size={40} strokeWidth={2.5} className="text-muted-foreground" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold">Not Connected</p>
              <p className="text-muted-foreground">Make sure you have a running Cardinal instance!</p>
            </div>
          </div>
        ) : hasNoEntities ? (
          <div className="flex flex-col gap-4 items-center pt-72 col-span-4">
            <Box size={40} strokeWidth={2.5} className="text-muted-foreground" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold">No Entities Found</p>
              <p className="text-muted-foreground">Create entities in Cardinal to display them here</p>
            </div>
          </div>
        ) : (
          <>
            <TabsContent value="card">
              <EntityCards entities={entities} />
            </TabsContent>
            <TabsContent value="list">
              <EntityList entities={entities} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </>
  )
}
