import { describe, it, expect } from 'vitest'
import {
  parseTimestamp,
  toLocalTimeStr,
  toUtcTimeStr,
  toIsoStr,
  timestampToDateInput,
  dateToTimestamp,
} from './utils'

describe('parseTimestamp', () => {
  it('parses valid s-unit timestamp to ms', () => {
    const r = parseTimestamp('1700000000', 's')
    expect(r).toEqual(1700000000000)
  })

  it('parses valid ms-unit timestamp as-is', () => {
    const r = parseTimestamp('1700000000000', 'ms')
    expect(r).toEqual(1700000000000)
  })

  it('rejects empty string', () => {
    const r = parseTimestamp('', 's')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects non-numeric input', () => {
    const r = parseTimestamp('abc', 's')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects value > 1e15 ms (beyond 30828-05-24)', () => {
    const r = parseTimestamp('9999999999999999', 'ms')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })
})

describe('toLocalTimeStr / toUtcTimeStr / toIsoStr', () => {
  const ms = new Date('2023-11-14T08:00:00Z').getTime()

  it('toUtcTimeStr formats UTC correctly', () => {
    expect(toUtcTimeStr(ms)).toBe('2023-11-14 08:00:00')
  })

  it('toIsoStr returns ISO 8601', () => {
    expect(toIsoStr(ms)).toBe('2023-11-14T08:00:00.000Z')
  })

  it('toLocalTimeStr returns local formatted string', () => {
    // 本地时区因环境而异，只断言非空且含年月日
    const s = toLocalTimeStr(ms)
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})

describe('timestampToDateInput', () => {
  it('produces datetime-local compatible local value', () => {
    const ms = new Date('2023-11-14T08:00:00Z').getTime()
    const v = timestampToDateInput(ms)
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })
})

describe('dateToTimestamp', () => {
  it('converts valid datetime-local string to s', () => {
    // 用 UTC 时区固定值：2023-11-14T08:00:00Z
    const r = dateToTimestamp('2023-11-14T08:00:00', 's')
    // 本地时区偏移未知，用 new Date 验证一致性
    const expected = Math.round(new Date('2023-11-14T08:00:00').getTime() / 1000)
    expect(r).toEqual(expected)
  })

  it('converts valid datetime-local string to ms', () => {
    const r = dateToTimestamp('2023-11-14T08:00:00', 'ms')
    const expected = new Date('2023-11-14T08:00:00').getTime()
    expect(r).toEqual(expected)
  })

  it('rejects empty string', () => {
    const r = dateToTimestamp('', 's')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })

  it('rejects invalid date string', () => {
    const r = dateToTimestamp('not-a-date', 's')
    expect(typeof r).toBe('object')
    expect((r as { error: string }).error).toBeTruthy()
  })
})
