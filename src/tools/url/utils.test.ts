import { describe, it, expect } from 'vitest'
import { encodeUrl, decodeUrl } from './utils'

describe('encodeUrl', () => {
  it('default uses encodeURIComponent (space → %20)', () => {
    expect(encodeUrl('hello world')).toBe('hello%20world')
  })

  it('default encodes special chars', () => {
    expect(encodeUrl('a:b?c=d&e')).toBe('a%3Ab%3Fc%3Dd%26e')
  })

  it('uriOnly uses encodeURI (keeps :/?/&)', () => {
    expect(encodeUrl('https://example.com/a b?c=d', true)).toBe(
      'https://example.com/a%20b?c=d',
    )
  })

  it('empty string → empty string', () => {
    expect(encodeUrl('')).toBe('')
  })

  it('Chinese text encodes correctly', () => {
    const r = encodeUrl('你好')
    expect(r).toBe(encodeURIComponent('你好'))
  })
})

describe('decodeUrl', () => {
  it('decodes %20 to space', () => {
    expect(decodeUrl('hello%20world')).toBe('hello world')
  })

  it('decodes percent-encoded Chinese', () => {
    expect(decodeUrl(encodeURIComponent('你好'))).toBe('你好')
  })

  it('rejects invalid % sequence %zz', () => {
    const r = decodeUrl('%zz')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects orphan %E4 (incomplete UTF-8)', () => {
    const r = decodeUrl('%E4')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects trailing % (100%)', () => {
    const r = decodeUrl('100%')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('empty string → empty string (not an error)', () => {
    expect(decodeUrl('')).toBe('')
  })

  it('does not throw on any input', () => {
    expect(() => decodeUrl('%')).not.toThrow()
    expect(() => decodeUrl('%%')).not.toThrow()
  })
})
