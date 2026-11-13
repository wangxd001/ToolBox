export type TsParseResult = number | { error: string }

const MAX_MS = 1e15 // 30828-05-24T23:20:32Z，超出合理时间戳范围

export function parseTimestamp(input: string, unit: 's' | 'ms'): TsParseResult {
  const trimmed = input.trim()
  if (trimmed === '') return { error: '输入为空' }
  if (!/^-?\d+$/.test(trimmed)) return { error: '时间戳必须为整数' }
  const ms = unit === 's' ? Number(trimmed) * 1000 : Number(trimmed)
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_MS) {
    return { error: '时间戳超出合理范围（±1e15 毫秒）' }
  }
  return ms
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

export function toLocalTimeStr(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function toUtcTimeStr(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

export function toIsoStr(ms: number): string {
  return new Date(ms).toISOString()
}

/** 生成喂给 <input type="datetime-local"> 的本地时间值 */
export function timestampToDateInput(ms: number): string {
  const d = new Date(ms)
  const local = new Date(ms - d.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export type DateParseResult = number | { error: string }

export function dateToTimestamp(dateStr: string, unit: 's' | 'ms'): DateParseResult {
  if (dateStr === '') return { error: '日期输入为空' }
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return { error: '日期格式无效' }
  const ms = d.getTime()
  return unit === 's' ? Math.round(ms / 1000) : ms
}
