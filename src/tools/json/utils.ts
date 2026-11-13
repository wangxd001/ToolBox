export type JsonError = { line: number; column: number; message: string }

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: JsonError }

export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: JsonError }

/** 从 JSON.parse 的错误信息提取行/列（"at position N" 或 "at line L column C"） */
function extractPosition(input: string, rawMessage: string): JsonError {
  const lineMatch = rawMessage.match(/line (\d+) column (\d+)/)
  if (lineMatch) {
    return {
      line: Number(lineMatch[1]),
      column: Number(lineMatch[2]),
      message: rawMessage,
    }
  }
  const posMatch = rawMessage.match(/position (\d+)/)
  if (posMatch) {
    const pos = Number(posMatch[1])
    const before = input.slice(0, pos)
    const line = before.split('\n').length
    const column = pos - before.lastIndexOf('\n')
    return { line, column, message: rawMessage }
  }
  // 无法定位（某些引擎）：定位到末尾
  const lines = input.split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
    message: rawMessage,
  }
}

export function validateJson(input: string): ValidationResult {
  if (input.trim() === '') {
    return { ok: false, error: { line: 1, column: 1, message: '输入为空' } }
  }
  try {
    JSON.parse(input)
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: extractPosition(input, msg) }
  }
}

export function parseJsonSafe(input: string): ParseResult {
  if (input.trim() === '') {
    return { ok: false, error: { line: 1, column: 1, message: '输入为空' } }
  }
  try {
    return { ok: true, value: JSON.parse(input) }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: extractPosition(input, msg) }
  }
}

export function formatJson(input: string, indent: 2 | 4): string | { error: string } {
  const r = parseJsonSafe(input)
  if (!r.ok) return { error: r.error.message }
  return JSON.stringify(r.value, null, indent)
}

export function minifyJson(input: string): string | { error: string } {
  const r = parseJsonSafe(input)
  if (!r.ok) return { error: r.error.message }
  return JSON.stringify(r.value)
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep)
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeysDeep(obj[key])
    }
    return sorted
  }
  return value
}
