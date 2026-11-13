export type FormatOpts = { upper?: boolean; noHyphen?: boolean; curly?: boolean }

export function formatUuid(raw: string, opts: FormatOpts = {}): string {
  // 归一化：去花括号、去横线（内部处理），再按选项还原
  let s = raw.replace(/^[{]+/, '').replace(/[}]+$/, '').replace(/-/g, '')
  if (s.length !== 32) return raw // 非 UUID 形状，原样返回
  // 重新插入横线
  s = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
  if (opts.upper) s = s.toUpperCase()
  if (opts.noHyphen) s = s.replace(/-/g, '')
  if (opts.curly) s = `{${s}}`
  return s
}

export function isValidUuid(v: string): boolean {
  const s = v.trim().replace(/^[{]+/, '').replace(/[}]+$/, '').replace(/-/g, '').toLowerCase()
  if (s.length !== 32) return false
  if (!/^[0-9a-f]{32}$/.test(s)) return false
  // v4: version 位（第 13 字符）必须为 4
  if (s[12] !== '4') return false
  // variant 位（第 17 字符）必须 ∈ {8,9,a,b}
  return '89ab'.includes(s[16])
}

export function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(100, Math.max(1, Math.round(n)))
}

export function randomUuid(crypto?: Crypto): string {
  const c = crypto ?? globalThis.crypto
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }
  // 降级：getRandomValues 手工构造 v4
  const bytes = new Uint8Array(16)
  c.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
