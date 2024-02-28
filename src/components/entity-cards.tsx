import { Entity } from "@/lib/types"
import { ComponentDetails } from "@/components/component-details"

interface EntityCardsProps {
  entities: Entity[]
}

// TODO: make this responsive, along with the sidebar
export function EntityCards({ entities }: EntityCardsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

    </>
  )
}

interface EntityCardProps {
  entity: Entity
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <>
      <div className="bg-background border border-border rounded-lg font-mono text-sm">
        <div className="px-3 py-2 font-bold border-b border-border">
          Entity {entity.id}
        </div>
        <div className="px-3 py-2 space-y-2">
          {Object.keys(entity.components).map((name) => (
            <ComponentDetails key={name} name={name} component={entity.components[name]} />
          ))}
        </div>
      </div>
    </>
  )
}
