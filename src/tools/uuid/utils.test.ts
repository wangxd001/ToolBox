import { describe, it, expect } from 'vitest'
import {
  formatUuid,
  isValidUuid,
  clampCount,
  randomUuid,
} from './utils'

describe('formatUuid', () => {
  const raw = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

  it('default: lowercase with hyphens', () => {
    expect(formatUuid(raw)).toBe(raw)
  })

  it('upper', () => {
    expect(formatUuid(raw, { upper: true })).toBe(raw.toUpperCase())
  })

  it('noHyphen', () => {
    expect(formatUuid(raw, { noHyphen: true })).toBe(raw.replace(/-/g, ''))
  })

  it('curly', () => {
    expect(formatUuid(raw, { curly: true })).toBe(`{${raw}}`)
  })

  it('upper + noHyphen + curly', () => {
    expect(formatUuid(raw, { upper: true, noHyphen: true, curly: true })).toBe(
      `{${raw.replace(/-/g, '').toUpperCase()}}`,
    )
  })

  it('accepts input without hyphens (case-insensitive)', () => {
    expect(formatUuid(raw.replace(/-/g, ''), { noHyphen: true })).toBe(
      raw.replace(/-/g, ''),
    )
  })
})

describe('isValidUuid', () => {
  const valid = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

  it('accepts standard v4 with hyphens', () => {
    expect(isValidUuid(valid)).toBe(true)
  })

  it('accepts uppercase', () => {
    expect(isValidUuid(valid.toUpperCase())).toBe(true)
  })

  it('accepts no-hyphen form', () => {
    expect(isValidUuid(valid.replace(/-/g, ''))).toBe(true)
  })

  it('accepts curly-brace form', () => {
    expect(isValidUuid(`{${valid}}`)).toBe(true)
  })

  it('rejects wrong length', () => {
    expect(isValidUuid('123')).toBe(false)
  })

  it('rejects non-hex chars', () => {
    expect(isValidUuid('zzzzzzzz-zzzz-4zzz-9zzz-zzzzzzzzzzzz')).toBe(false)
  })

  it('rejects v1 (version digit 1)', () => {
    expect(isValidUuid('1b9d6bcd-bbfd-1b2d-9b5d-ab8dfbbd4bed')).toBe(false)
  })
})

describe('clampCount', () => {
  it('clamps below 1 to 1', () => {
    expect(clampCount(0)).toBe(1)
    expect(clampCount(-5)).toBe(1)
  })

  it('clamps above 100 to 100', () => {
    expect(clampCount(101)).toBe(100)
    expect(clampCount(999)).toBe(100)
  })

  it('passes through valid range', () => {
    expect(clampCount(1)).toBe(1)
    expect(clampCount(50)).toBe(50)
    expect(clampCount(100)).toBe(100)
  })
})

describe('randomUuid', () => {
  const V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

  it('produces valid v4 when crypto.randomUUID is available', () => {
    const id = randomUuid()
    expect(id).toMatch(V4_RE)
  })

  it('produces valid v4 via fallback when randomUUID is absent', () => {
    const fakeCrypto = {
      getRandomValues: (arr: Uint32Array) => {
        // deterministic fill for test
        arr.fill(0x1234)
        return arr
      },
    } as unknown as Crypto
    const id = randomUuid(fakeCrypto)
    expect(id).toMatch(V4_RE)
  })

  it('version digit is always 4', () => {
    for (let i = 0; i < 20; i++) {
      const id = randomUuid()
      expect(id[14]).toBe('4')
    }
  })

  it('variant digit is one of 8,9,a,b', () => {
    for (let i = 0; i < 20; i++) {
      const id = randomUuid()
      expect('89ab'.includes(id[19])).toBe(true)
    }
  })
})
