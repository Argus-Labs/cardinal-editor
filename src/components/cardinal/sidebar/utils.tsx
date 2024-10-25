import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { ZodType, z } from 'zod'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ComponentProperty, WorldField } from '@/lib/types'

export const formatName = (name: string) => {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const goNumberTypes = new Set([
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'int8',
  'int16',
  'int32',
  'int64',
  'float32',
  'float64',
  'complex64',
  'complex128',
  'byte',
  'rune',
  'uint',
  'int',
  'uintptr',
])

// TODO: handle non-primitive types (struts, maps, arrays, slices)
// handling them would take more effort than expected, will continue this if the
// demands are high. users would have to refactor their message/query request structs,
// but message/query functionalities should still be fine if we only support primitives for now.
// edge cases:
// - []number -> '[]number'
// - struct{a string} -> js object {a: 'string'}
// - map[string]number -> 'map[string]number'
// - []struct{a string} -> '[]struct{a string}'
// - []Type -> '[]msg.Type' (this should be handled in cardinal /world handler)
export const goTypeToZodType = (type: string) => {
  // if type is a primitive go type
  if (goNumberTypes.has(type)) return z.coerce.number()
  if (type === 'string') return z.string()
  if (type === 'bool') return z.boolean().optional()

  // else just default to string for now & parse it into an object
  return z.string().transform((s) => JSON.parse(s) as object)
}

const goToDefaultJSType = (type: string) => {
  if (goNumberTypes.has(type)) return 0
  if (type === 'string') return ''
  if (type === 'bool') return false
  return ''
}

export const formSchema = (wf: WorldField): ZodType => {
  return z.object({
    persona: z.string(),
    ...Object.keys(wf.fields).reduce(
      (acc, k) => ({ ...acc, [k]: goTypeToZodType(wf.fields[k]) }),
      {},
    ),
  })
}

export const defaultValues = (wf: WorldField): ComponentProperty => {
  return {
    persona: '',
    ...Object.keys(wf.fields).reduce(
      (acc, k) => ({ ...acc, [k]: goToDefaultJSType(wf.fields[k]) }),
      {},
    ),
  }
}

export const goTypeToInputComponent = (
  type: string,
  field: ControllerRenderProps<FieldValues, string>,
) => {
  if (goNumberTypes.has(type)) {
    return <Input required type="number" className="h-8" {...field} />
  }
  if (type === 'string') {
    return <Input required className="h-8" {...field} />
  }
  if (type === 'bool') {
    return (
      <Switch checked={field.value as boolean} onCheckedChange={field.onChange} className="block" />
    )
  }
  // default to string
  return <Input required className="h-8" {...field} />
}
