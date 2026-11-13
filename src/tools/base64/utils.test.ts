import { describe, it, expect } from 'vitest'
import {
  encodeBase64,
  decodeBase64,
} from './utils'

describe('encodeBase64', () => {
  it('ASCII round-trips correctly', () => {
    const enc = encodeBase64('hello')
    expect(enc).toBe('aGVsbG8=')
  })

  it('UTF-8 Chinese encodes and decodes back to original', () => {
    const text = '你好，世界'
    const enc = encodeBase64(text)
    const dec = decodeBase64(enc)
    expect(dec).toBe(text)
  })

  it('urlSafe: true produces no + or /', () => {
    // 构造产生 + 和 / 的输入：字节 0xFB 0xFF 0xBF 等
    const bytes = [0xfb, 0xff, 0xbf, 0x00, 0xfb].map((b) => String.fromCharCode(b)).join('')
    const urlSafeEnc = encodeBase64(bytes, true)
    expect(urlSafeEnc).not.toContain('+')
    expect(urlSafeEnc).not.toContain('/')
    // urlSafe 解码还原
    const dec = decodeBase64(urlSafeEnc, true)
    expect(dec).toBe(bytes)
  })

  it('urlSafe strips padding when optional', () => {
    const enc = encodeBase64('a', true)
    // 'a' → 'YQ=='，urlSafe 去 padding 后为 'YQ'
    expect(enc).toBe('YQ')
  })
})

describe('decodeBase64', () => {
  it('decodes standard base64', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello')
  })

  it('decodes urlSafe alphabet (- and _)', () => {
    // 'aGVsbG8/' → urlSafe 'aGVsbG8_'
    const std = encodeBase64('hi')
    const urlSafe = std.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const dec = decodeBase64(urlSafe, true)
    expect(dec).toBe('hi')
  })

  it('rejects non-base64 characters', () => {
    const r = decodeBase64('hello!!!not-base64')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects input whose length mod 4 === 1', () => {
    const r = decodeBase64('abcde') // 5 chars → invalid
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('empty string decodes to empty string', () => {
    expect(decodeBase64('')).toBe('')
  })
})
