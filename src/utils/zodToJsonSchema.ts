// Zod v4 to JSON Schema converter
// Zod v4 changed the API significantly - using type introspection

import { z } from 'zod'

// Re-export z for use in schema definitions
export { z }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZod = z.ZodType<any, any, any>

/**
 * Convert Zod schema to JSON Schema format for API calls.
 * Supports the core types used in Beast CLI tools.
 */
export function zodToJsonSchema(schema: AnyZod): Record<string, unknown> {
  return convert(schema)
}

// Zod type registry for v4
const TYPES = {
  ZodString: 'ZodString',
  ZodNumber: 'ZodNumber',
  ZodBoolean: 'ZodBoolean',
  ZodArray: 'ZodArray',
  ZodObject: 'ZodObject',
  ZodOptional: 'ZodOptional',
  ZodNullable: 'ZodNullable',
  ZodEnum: 'ZodEnum',
  ZodUnion: 'ZodUnion',
  ZodIntersection: 'ZodIntersection',
  ZodLiteral: 'ZodLiteral',
  ZodAny: 'ZodAny',
  ZodUnknown: 'ZodUnknown',
  ZodEffects: 'ZodEffects',
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTypeName(schema: AnyZod): string {
  // Zod v4 uses .constructor.name
  const name = schema.constructor?.name
  return name ?? 'ZodUnknown'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDef(schema: AnyZod): any {
  // In Zod v4, the definition is on the schema itself via symbol
  // Try to access the internal representation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = (schema as any)[Symbol.toStringTag]
  return def ?? {}
}

function convert(schema: AnyZod, depth = 0): Record<string, unknown> {
  // Prevent infinite recursion
  if (depth > 20) {
    return { type: 'string', description: 'Max depth exceeded' }
  }

  const typeName = getTypeName(schema)

  // ZodString
  if (typeName === 'ZodString' || typeName === TYPES.ZodString) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = schema as any
    const jsonSchema: Record<string, unknown> = { type: 'string' }
    // Zod v4 string checks
    if (s.minLength !== undefined) jsonSchema.minLength = s.minLength
    if (s.maxLength !== undefined) jsonSchema.maxLength = s.maxLength
    if (s.pattern !== undefined) jsonSchema.pattern = s.pattern
    return jsonSchema
  }

  // ZodNumber
  if (typeName === 'ZodNumber' || typeName === TYPES.ZodNumber) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n = schema as any
    const jsonSchema: Record<string, unknown> = { type: 'number' }
    if (n.minValue !== undefined) jsonSchema.minimum = n.minValue
    if (n.maxValue !== undefined) jsonSchema.maximum = n.maxValue
    return jsonSchema
  }

  // ZodBoolean
  if (typeName === 'ZodBoolean' || typeName === TYPES.ZodBoolean) {
    return { type: 'boolean' }
  }

  // ZodArray
  if (typeName === 'ZodArray' || typeName === TYPES.ZodArray) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = schema as any
    const itemType = a.elementType ?? a.items ?? a._def?.type ?? z.unknown()
    return {
      type: 'array',
      items: convert(itemType, depth + 1),
    }
  }

  // ZodObject
  if (typeName === 'ZodObject' || typeName === TYPES.ZodObject) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = schema as any
    const shape = o._def?.shape?.() ?? {}
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = convert(value as AnyZod, depth + 1)
      // Zod v4: required fields don't have ?
      const isOptional = String(key).endsWith('?')
      if (!isOptional) {
        required.push(key)
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    }
  }

  // ZodOptional
  if (typeName === 'ZodOptional' || typeName === TYPES.ZodOptional) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = schema as any
    const inner = o._def?.innerType ?? o._def?.unwrap?.() ?? z.unknown()
    return convert(inner, depth + 1)
  }

  // ZodNullable
  if (typeName === 'ZodNullable' || typeName === TYPES.ZodNullable) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n = schema as any
    const inner = n._def?.innerType ?? n._def?.unwrap?.() ?? z.unknown()
    const innerSchema = convert(inner, depth + 1)
    return {
      ...innerSchema,
      type: [innerSchema.type, 'null'].flat(),
    }
  }

  // ZodEnum
  if (typeName === 'ZodEnum' || typeName === TYPES.ZodEnum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = schema as any
    const values = e._def?.values ?? []
    return {
      type: 'string',
      enum: values,
    }
  }

  // ZodUnion
  if (typeName === 'ZodUnion' || typeName === TYPES.ZodUnion) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = schema as any
    const options = u._def?.options ?? []
    return {
      anyOf: options.map((opt: AnyZod) => convert(opt, depth + 1)),
    }
  }

  // ZodIntersection
  if (typeName === 'ZodIntersection' || typeName === TYPES.ZodIntersection) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = schema as any
    const left = i._def?.left ?? z.unknown()
    const right = i._def?.right ?? z.unknown()
    return {
      allOf: [
        convert(left as AnyZod, depth + 1),
        convert(right as AnyZod, depth + 1),
      ],
    }
  }

  // ZodLiteral
  if (typeName === 'ZodLiteral' || typeName === TYPES.ZodLiteral) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = schema as any
    const value = l._def?.value
    return {
      type: typeof value,
      const: value,
    }
  }

  // ZodAny
  if (typeName === 'ZodAny' || typeName === TYPES.ZodAny) {
    return {}
  }

  // ZodUnknown
  if (typeName === 'ZodUnknown' || typeName === TYPES.ZodUnknown) {
    return {}
  }

  // ZodEffects (transforms)
  if (typeName === 'ZodEffects' || typeName === TYPES.ZodEffects) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eff = schema as any
    const inner = eff._def?.schema ?? z.unknown()
    return convert(inner as AnyZod, depth + 1)
  }

  // Fallback: try to parse as object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asAny = schema as any
  if (asAny._def && typeof asAny._def === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def = asAny._def as any
    if (def.typeName) return convertByTypeName(def.typeName as string, def, depth)
  }

  return { type: 'string', description: `Unknown type: ${typeName}` }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertByTypeName(typeName: string, def: any, depth: number): Record<string, unknown> {
  switch (typeName) {
    case TYPES.ZodString:
      return { type: 'string' }
    case TYPES.ZodNumber:
      return { type: 'number' }
    case TYPES.ZodBoolean:
      return { type: 'boolean' }
    case TYPES.ZodObject: {
      const shape = def.shape?.() ?? {}
      const properties: Record<string, unknown> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convert(value as AnyZod, depth + 1)
        if (!String(key).endsWith('?')) required.push(key)
      }
      return { type: 'object', properties, ...(required.length > 0 && { required }) }
    }
    case TYPES.ZodArray: {
      const item = def.type ?? def.items ?? z.unknown()
      return { type: 'array', items: convert(item as AnyZod, depth + 1) }
    }
    case TYPES.ZodOptional: {
      const inner = def.innerType ?? def.unwrap?.() ?? z.unknown()
      return convert(inner as AnyZod, depth + 1)
    }
    case TYPES.ZodNullable: {
      const inner = def.innerType ?? def.unwrap?.() ?? z.unknown()
      const innerSchema = convert(inner as AnyZod, depth + 1)
      return { ...innerSchema, type: [innerSchema.type, 'null'].flat() }
    }
    case TYPES.ZodEnum:
      return { type: 'string', enum: def.values ?? [] }
    case TYPES.ZodLiteral:
      return { type: typeof def.value, const: def.value }
    default:
      return { type: 'string' }
  }
}
