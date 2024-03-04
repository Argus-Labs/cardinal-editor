import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Box, LayoutGrid, List, Unlink } from 'lucide-react'

import { EditEntityGroupSheet, NewEntityGroupSheet } from '@/components/entity-group-sheets'
import { EntityCards, EntityList } from '@/components/entity-views'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCardinal } from '@/lib/cardinal-provider'
import { useConfig } from '@/lib/config-provider'
import { stateQueryOptions } from '@/lib/query-options'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { cardinalUrl, isCardinalConnected } = useCardinal()
  const { data: entities } = useQuery(stateQueryOptions({ cardinalUrl, isCardinalConnected }))
  const { config, setConfig } = useConfig()
  const { view, entityGroups } = config

  const hasNoEntities = !(entities && entities.length > 0)
  // TODO: this is probably very inefficient. come up with a better filter algorithm
  const grouped = new Set()
  const filtered = entityGroups.map((eg) => ({
    ...eg,
    entities:
      entities?.filter((e) => {
        const exists = eg.components.filter((c) => e.components[c]).length > 0
        if (exists) grouped.add(e.id)
        return exists
      }) ?? [],
  }))
  const ungrouped = entities?.filter((e) => !grouped.has(e.id)) ?? []

  const handleTabSwitch = (view: string) => {
    setConfig({ ...config, view })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Entities</h1>
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={handleTabSwitch} className="space-y-6">
              <TabsList className="bg-background border">
                <TabsTrigger value="card" className="data-[state=active]:bg-muted px-2">
                  <LayoutGrid size={20} />
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-muted px-2">
                  <List size={20} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <NewEntityGroupSheet />
          </div>
        </div>
        {!isCardinalConnected ? (
          <div className="flex flex-col gap-4 items-center pt-72">
            <Unlink size={40} strokeWidth={2.5} className="text-muted-foreground" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold">Not Connected</p>
              <p className="text-muted-foreground">
                Make sure you have a running Cardinal instance!
              </p>
            </div>
          </div>
        ) : hasNoEntities ? (
          <div className="flex flex-col gap-4 items-center pt-72 col-span-4">
            <Box size={40} strokeWidth={2.5} className="text-muted-foreground" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold">No Entities Found</p>
              <p className="text-muted-foreground">
                Create entities in Cardinal to display them here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((eg) => (
              <div key={eg.name} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <h2 className="font-semibold">{eg.name}</h2>
                    <EditEntityGroupSheet
                      entityGroup={{ name: eg.name, components: eg.components }}
                    />
                    <p className="ml-auto text-muted-foreground text-xs font-medium">
                      {eg.entities.length} results
                    </p>
                  </div>
                  {eg.components.map((c) => (
                    <Badge
                      key={c}
                      className="bg-background text-foreground border border-border hover:bg-background"
                    >
                      {c}
                    </Badge>
                  ))}
                  <hr className="border-border" />
                </div>
                {view === 'card' ? (
                  <EntityCards entities={eg.entities} />
                ) : (
                  <EntityList entities={eg.entities} />
                )}
              </div>
            ))}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Ungrouped</h2>
                  <p className="text-muted-foreground text-xs font-medium">
                    {ungrouped.length} results
                  </p>
                </div>
                <hr className="border-border" />
              </div>
              {view === 'card' ? (
                <EntityCards entities={ungrouped} />
              ) : (
                <EntityList entities={ungrouped} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
