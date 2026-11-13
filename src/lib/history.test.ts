import { describe, it, expect } from 'vitest'
import {
  readHistory,
  writeHistory,
  clearHistory,
} from './history'

// 内存 Storage mock
function makeMockStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size },
  } as unknown as Storage
}

describe('readHistory', () => {
  it('returns [] when key absent', () => {
    const storage = makeMockStorage()
    expect(readHistory('toolbox.history.timestamp', storage)).toEqual([])
  })

  it('returns [] when stored value is corrupt JSON', () => {
    const storage = makeMockStorage()
    storage.setItem('toolbox.history.json', 'not-valid-json{{{')
    expect(readHistory('toolbox.history.json', storage)).toEqual([])
  })

  it('returns parsed array when valid', () => {
    const storage = makeMockStorage()
    storage.setItem('toolbox.history.base64', JSON.stringify([{ id: '1', text: 'a', time: 0 }]))
    expect(readHistory('toolbox.history.base64', storage)).toEqual([{ id: '1', text: 'a', time: 0 }])
  })

  it('throws on bare key (no toolbox. prefix)', () => {
    const storage = makeMockStorage()
    expect(() => readHistory('theme', storage)).toThrow('must start with "toolbox."')
  })
})

describe('writeHistory', () => {
  it('writes entries normally within limits', () => {
    const storage = makeMockStorage()
    const result = writeHistory('toolbox.history.timestamp', [
      { id: '1', text: 'a', time: 1 },
      { id: '2', text: 'b', time: 2 },
    ], { max: 10 }, storage)
    expect(result).toEqual({})
    expect(readHistory('toolbox.history.timestamp', storage)).toEqual([
      { id: '1', text: 'a', time: 1 },
      { id: '2', text: 'b', time: 2 },
    ])
  })

  it('drops oldest entries beyond max (keeps most recent)', () => {
    const storage = makeMockStorage()
    const entries = Array.from({ length: 15 }, (_, i) => ({ id: String(i), text: String(i), time: i }))
    writeHistory('toolbox.history.uuid', entries, { max: 10 }, storage)
    const result = readHistory('toolbox.history.uuid', storage)
    expect(result).toHaveLength(10)
    expect(result[0].id).toBe('5') // oldest 5 dropped, first remaining is index 5
    expect(result[9].id).toBe('14') // most recent kept
  })

  it('skips single entry > maxItemBytes and returns { skipped: true }', () => {
    const storage = makeMockStorage()
    const small = { id: 'a', text: 'ok', time: 1 }
    const big = { id: 'b', text: 'x'.repeat(200_000), time: 2 } // >100KB
    const result = writeHistory('toolbox.history.json', [small, big], { max: 5, maxItemBytes: 100 * 1024 }, storage)
    expect(result).toEqual({ skipped: true })
    const stored = readHistory('toolbox.history.json', storage)
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('a') // big entry not written
  })

  it('returns {} when all entries within byte limit', () => {
    const storage = makeMockStorage()
    const result = writeHistory('toolbox.history.json', [{ id: 'a', text: 'small', time: 1 }], { max: 5, maxItemBytes: 100 * 1024 }, storage)
    expect(result).toEqual({})
  })

  it('throws on bare key', () => {
    const storage = makeMockStorage()
    expect(() => writeHistory('history', [{ id: '1' }], { max: 10 }, storage)).toThrow('must start with "toolbox."')
  })
})

describe('clearHistory', () => {
  it('removes the key from storage', () => {
    const storage = makeMockStorage()
    storage.setItem('toolbox.history.url', JSON.stringify([{ id: '1', text: 'a', time: 0 }]))
    clearHistory('toolbox.history.url', storage)
    expect(storage.getItem('toolbox.history.url')).toBeNull()
  })

  it('throws on bare key', () => {
    const storage = makeMockStorage()
    expect(() => clearHistory('url', storage)).toThrow('must start with "toolbox."')
  })
})
