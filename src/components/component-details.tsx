interface ComponentDetailsProps {
  component: any[]
  id: number
}

// TODO: add case for object types (arrays are included as objects too)
const formatAttribute = (attr: any): React.ReactNode => {
  switch (typeof attr) {
    case 'string': return <span className="text-green-500">{`"${attr}"`}</span>
    case 'number': return <span className="text-orange-500">{attr}</span>
    case 'boolean': return <span className="text-blue-500">{attr}</span>
    default: return <span>{attr}</span>
  }
}

// TODO: replace id with component name once it's added in the payload
export function ComponentDetails({ component, id }: ComponentDetailsProps) {
  const attributes = Object.keys(component)
  return (
    // 0.8125rem / 13px since the default sizes are too small/big
    <details className="space-y-1 text-[0.8125rem]">
      {/* TODO: change to component name once it is in the payload */}
      <summary className="font-bold">
        Component {id}
        <span className="ml-2 text-muted-foreground font-medium">
          {`{} ${attributes.length} keys`}
        </span>
      </summary>
      <div>
        {attributes.map((attr) => (
          <p key={attr} className="ml-3 text-muted-foreground font-medium">
            {/* @ts-ignore */}
            {attr}: {formatAttribute(component[attr])}
          </p>
        ))}
      </div>
    </details>
  )
}
