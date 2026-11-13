export type HistoryEntry = { id: string; text: string; time: number }

function assertKey(key: string): void {
  if (!key.startsWith('toolbox.')) {
    throw new Error(`history key must start with "toolbox.", got: "${key}"`)
  }
}

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length
}

export function readHistory<T = HistoryEntry>(key: string, storage: Storage = window.localStorage): T[] {
  assertKey(key)
  try {
    const raw = storage.getItem(key)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as T[]
  } catch {
    // corrupt JSON or not an array — treat as empty
    return []
  }
}

export function writeHistory<T = HistoryEntry>(
  key: string,
  entries: T[],
  cfg: { max: number; maxItemBytes?: number },
  storage: Storage = window.localStorage,
): { skipped?: boolean } {
  assertKey(key)
  let toWrite = entries
  if (toWrite.length > cfg.max) {
    toWrite = toWrite.slice(toWrite.length - cfg.max)
  }

  let skipped = false
  if (cfg.maxItemBytes !== undefined) {
    toWrite = toWrite.filter((entry) => {
      const bytes = byteLength(JSON.stringify(entry))
      if (bytes > cfg.maxItemBytes!) {
        skipped = true
        return false
      }
      return true
    })
  }

  storage.setItem(key, JSON.stringify(toWrite))
  return skipped ? { skipped: true } : {}
}

export function clearHistory(key: string, storage: Storage = window.localStorage): void {
  assertKey(key)
  storage.removeItem(key)
}
