import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Box, LayoutGrid, List, Unlink } from 'lucide-react';

import { EntityView } from '@/components/entity-views';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardinal } from '@/lib/cardinal-provider';
import { useConfig } from '@/lib/config-provider';
import { EntityGroupSheet } from '@/components/entity-group-sheet';
import { stateQueryOptions } from '@/lib/query-options';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { data: entities } = useQuery(stateQueryOptions({ cardinalUrl, isCardinalConnected }))
  const { config, setConfig } = useConfig()

  const hasNoEntities = !(entities && entities.length > 0)

  const handleTabSwitch = (view: string) => {
    setConfig({ ...config, view })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Entities</h1>
          <div className="flex items-center gap-4">
            <Tabs value={config.view} onValueChange={handleTabSwitch} className="space-y-6">
              <TabsList className="bg-background border">
                <TabsTrigger value="card" className="data-[state=active]:bg-muted px-2">
                  <LayoutGrid size={20} />
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-muted px-2">
                  <List size={20} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <EntityGroupSheet />
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
            <EntityView view={config.view} entities={entities} />
          </>
        )}
      </div>
    </>
  )
}
