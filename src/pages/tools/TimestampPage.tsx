import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText, Toast } from '../../components/ErrorText'
import { ExampleButton } from '../../components/ExampleButton'
import { HistoryPanel } from '../../components/HistoryPanel'
import { Card, Btn, Segmented, Label, TextInput } from '../../components/ui'
import { CheckIcon, ClockIcon } from '../../components/Icons'
import { useSeo } from '../../lib/useSeo'
import {
  readHistory,
  writeHistory,
  clearHistory,
  HistoryEntry,
} from '../../lib/history'
import {
  parseTimestamp,
  toLocalTimeStr,
  toUtcTimeStr,
  toIsoStr,
  dateToTimestamp,
} from '../../tools/timestamp/utils'

const HISTORY_KEY = 'toolbox.history.timestamp'

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function TimestampPage() {
  useSeo('时间戳转换 - Toolbox', 'Unix 时间戳与日期时间互转，支持本地时区与 UTC。')
  const [searchParams, setSearchParams] = useSearchParams()

  const [nowMs, setNowMs] = useState(() => Date.now())
  const [unit, setUnit] = useState<'s' | 'ms'>(
    searchParams.get('unit') === 'ms' ? 'ms' : 's',
  )
  const [mode, setMode] = useState<'toTime' | 'toTs'>(
    searchParams.get('mode') === 'toTs' ? 'toTs' : 'toTime',
  )
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readHistory<HistoryEntry>(HISTORY_KEY),
  )

  const timerRef = useRef<number | null>(null)

  // 实时时钟
  useEffect(() => {
    timerRef.current = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  // toast 自动消失
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  // 读 URL 参数 ts（仅在首次挂载，避免覆盖用户输入）
  useEffect(() => {
    const ts = searchParams.get('ts')
    if (ts) {
      const u = (searchParams.get('unit') as 's' | 'ms') || 's'
      const parsed = parseTimestamp(ts, u)
      if (typeof parsed === 'number') {
        setTsInput(String(u === 's' ? Math.round(parsed / 1000) : parsed))
        setMode('toTime')
      } else {
        setToast(`URL 参数 ts 非法：${parsed.error}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pushToHistory = (text: string) => {
    const entries = [
      ...history,
      { id: makeId(), text, time: Date.now() },
    ]
    writeHistory(HISTORY_KEY, entries, { max: 10 })
    setHistory(readHistory<HistoryEntry>(HISTORY_KEY))
  }

  const handleConvertTs = () => {
    const parsed = parseTimestamp(tsInput, unit)
    if (typeof parsed === 'number') {
      setError(null)
      // 写 URL 参数
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('ts', String(unit === 's' ? Math.round(parsed / 1000) : parsed))
          next.set('unit', unit)
          next.set('mode', 'toTime')
          return next
        },
        { replace: true },
      )
      pushToHistory(`ts ${tsInput} (${unit})`)
    } else {
      setError(parsed.error)
    }
  }

  const handleConvertDate = () => {
    const parsed = dateToTimestamp(dateInput, 's')
    if (typeof parsed === 'number') {
      setError(null)
      pushToHistory(`date ${dateInput}`)
    } else {
      setError(parsed.error)
    }
  }

  const fillExample = () => {
    setTsInput(unit === 's' ? '1700000000' : '1700000000000')
    setDateInput('2023-11-14T08:00:00')
    setError(null)
    // 示例填入后立即转换，无需再点「转换」
    if (mode === 'toTime') {
      handleConvertTs()
    } else {
      handleConvertDate()
    }
  }

  const reset = () => {
    setTsInput('')
    setDateInput('')
    setError(null)
  }

  const currentTsDisplay =
    unit === 's' ? String(Math.round(nowMs / 1000)) : String(nowMs)

  const convertResult = (): string => {
    if (mode === 'toTime' && tsInput.trim() !== '') {
      const p = parseTimestamp(tsInput, unit)
      if (typeof p !== 'number') return ''
      return [
        `本地时间：${toLocalTimeStr(p)}`,
        `UTC：${toUtcTimeStr(p)}`,
        `ISO 8601：${toIsoStr(p)}`,
      ].join('\n')
    }
    if (mode === 'toTs' && dateInput !== '') {
      const p = dateToTimestamp(dateInput, 's')
      if (typeof p !== 'number') return ''
      const ms = p * 1000
      return `秒级：${p}\n毫秒级：${ms}`
    }
    return ''
  }

  const resultText = convertResult()

  // 历史条目形如「ts <值> (<s|ms>)」或「date <值>」
  const handlePick = (entry: HistoryEntry) => {
    const m = entry.text.match(/^ts (\S+) \((s|ms)\)/)
    if (m) {
      setTsInput(m[1])
      setUnit(m[2] as 's' | 'ms')
      setMode('toTime')
      window.setTimeout(handleConvertTs, 0)
      return
    }
    const dm = entry.text.match(/^date (.+)$/)
    if (dm) {
      setDateInput(dm[1])
      setMode('toTs')
      window.setTimeout(handleConvertDate, 0)
    }
  }

  return (
    <ToolLayout
      title="时间戳转换"
      description="Unix 时间戳与日期时间互转，本地时区 / UTC"
    >
      {/* 实时时钟 */}
      <Card
        title="当前时间戳"
        action={
          <Segmented
            options={[
              { value: 's', label: '秒' },
              { value: 'ms', label: '毫秒' },
            ]}
            value={unit}
            onChange={(v) => setUnit(v as 's' | 'ms')}
            className="w-40"
          />
        }
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <ClockIcon size={20} />
          </span>
          <div>
            <div className="font-mono text-2xl font-semibold tabular-nums">
              {currentTsDisplay}
            </div>
            <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {new Date(nowMs).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          {/* 模式切换 */}
          <Segmented
            options={[
              { value: 'toTime', label: '时间戳 → 时间' },
              { value: 'toTs', label: '时间 → 时间戳' },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as 'toTime' | 'toTs')
              setError(null)
            }}
          />

          {/* 输入区 */}
          {mode === 'toTime' ? (
            <div>
              <Label>时间戳（{unit === 's' ? '秒' : '毫秒'}）</Label>
              <TextInput
                type="text"
                inputMode="numeric"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="如 1700000000"
                className="font-mono"
              />
            </div>
          ) : (
            <div>
              <Label>日期时间</Label>
              <TextInput
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </div>
          )}

          {/* 操作按钮区 */}
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="primary" onClick={mode === 'toTime' ? handleConvertTs : handleConvertDate}>
              <CheckIcon size={16} />
              转换
            </Btn>
            <ExampleButton onClick={fillExample} />
            <Btn variant="ghost" onClick={reset}>
              重置
            </Btn>
            {resultText && <CopyButton text={resultText} label="复制结果" />}
          </div>

          {/* 输出区 */}
          {resultText && (
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
              {resultText}
            </pre>
          )}
        </div>
      </Card>

      {/* 错误区 */}
      <ErrorText message={error} />
      <Toast message={toast} />

      {/* 历史 */}
      <HistoryPanel
        entries={history}
        onClear={() => {
          clearHistory(HISTORY_KEY)
          setHistory([])
        }}
        onPick={handlePick}
      />
    </ToolLayout>
  )
}
