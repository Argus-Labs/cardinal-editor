// Entities are basically open maps/objects, I'll keep it as `any` for now to avoid fighting ts
interface EntityCardsProps {
  entities: any[]
}

// TODO: make this responsive, along with the sidebar
export function EntityCards({ entities }: EntityCardsProps) {
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

    </>
  )
}

interface EntityCardProps {
  entity: any
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <>
      <div className="bg-background border border-border rounded-lg font-mono text-sm">
        <div className="px-3 py-2 font-bold border-b border-border">
          Entity {entity.id}
        </div>
        <div className="px-3 py-2 whitespace-pre-wrap text-xs">
          {entity.data.map((component: any, i: number) => (
            <p key={i}>{JSON.stringify(component, null, 2)}</p>
          ))}
        </div>
      </div>
    </>
  )
}
