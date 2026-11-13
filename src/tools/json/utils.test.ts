import { describe, it, expect } from 'vitest'
import {
  validateJson,
  parseJsonSafe,
  formatJson,
  minifyJson,
  sortKeysDeep,
} from './utils'

describe('validateJson', () => {
  it('legal JSON → ok: true', () => {
    expect(validateJson('{"a":1}')).toEqual({ ok: true })
  })

  it('missing comma → ok: false with line/column', () => {
    const r = validateJson('{\n  "a": 1\n  "b": 2\n}')
    expect(r.ok).toBe(false)
    if (!r.ok && r.error) {
      expect(r.error.line).toBe(3)
      expect(r.error.column).toBeGreaterThan(0)
      expect(r.error.message).toBeTruthy()
    }
  })

  it('trailing comma → ok: false', () => {
    const r = validateJson('{"a":1,}')
    expect(r.ok).toBe(false)
  })

  it('bare string is valid JSON', () => {
    expect(validateJson('"hello"')).toEqual({ ok: true })
  })

  it('empty string → ok: false, message 输入为空', () => {
    const r = validateJson('')
    expect(r.ok).toBe(false)
    if (!r.ok && r.error) {
      expect(r.error.message).toContain('输入为空')
    }
  })

  it('whitespace-only → ok: false', () => {
    expect(validateJson('   \n  ').ok).toBe(false)
  })

  it('large single-line input with late error still locates position without throwing', () => {
    const filler = '"a":1,'.repeat(150_000) // ~900KB valid keys, single line
    const input = '{' + filler + '}' // trailing comma → error
    expect(() => validateJson(input)).not.toThrow()
    expect(input.length).toBeGreaterThan(800 * 1024)
    const r = validateJson(input)
    expect(r.ok).toBe(false)
    if (!r.ok && r.error) {
      // 单行大输入：列号应指向尾部（远大于 1），行号为 1
      expect(r.error.line).toBe(1)
      expect(r.error.column).toBeGreaterThan(1000)
    }
  })
})

describe('parseJsonSafe', () => {
  it('legal → value returned', () => {
    const r = parseJsonSafe('{"a":1}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toEqual({ a: 1 })
  })

  it('illegal → error with line/column', () => {
    const r = parseJsonSafe('{bad}')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.line).toBe(1)
      expect(r.error.column).toBeGreaterThan(0)
    }
  })
})

describe('formatJson', () => {
  it('2-space indent', () => {
    const r = formatJson('{"a":1,"b":[2,3]}', 2)
    expect(r).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}')
  })

  it('4-space indent', () => {
    const r = formatJson('{"a":1}', 4)
    expect(r).toBe('{\n    "a": 1\n}')
  })

  it('illegal input → error', () => {
    const r = formatJson('{', 2)
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })
})

describe('minifyJson', () => {
  it('removes all non-essential whitespace', () => {
    expect(minifyJson('{ "a" : [ 1 , 2 ] }')).toBe('{"a":[1,2]}')
  })

  it('preserves whitespace inside strings', () => {
    expect(minifyJson('{ "s" : "a b  c" }')).toBe('{"s":"a b  c"}')
  })

  it('illegal → error', () => {
    const r = minifyJson('nope')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })
})

describe('sortKeysDeep', () => {
  it('sorts top-level keys', () => {
    expect(sortKeysDeep({ c: 1, a: 2, b: 3 })).toEqual({ a: 2, b: 3, c: 1 })
  })

  it('sorts nested objects', () => {
    const v = sortKeysDeep({ z: { b: 1, a: 2 }, a: 0 })
    expect(v).toEqual({ a: 0, z: { a: 2, b: 1 } })
  })

  it('sorts objects inside arrays', () => {
    const v = sortKeysDeep([{ b: 1, a: 2 }])
    expect(v).toEqual([{ a: 2, b: 1 }])
  })

  it('does not reorder array elements', () => {
    const v = sortKeysDeep([3, 1, 2])
    expect(v).toEqual([3, 1, 2])
  })

  it('returns primitives unchanged', () => {
    expect(sortKeysDeep(42)).toBe(42)
    expect(sortKeysDeep('x')).toBe('x')
    expect(sortKeysDeep(null)).toBe(null)
  })
})
