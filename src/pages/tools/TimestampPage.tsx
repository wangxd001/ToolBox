import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText } from '../../components/ErrorText'
import { ExampleButton } from '../../components/ExampleButton'
import { HistoryPanel } from '../../components/HistoryPanel'
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
      <div className="mb-4 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">当前时间戳</div>
        <div className="font-mono text-lg">{currentTsDisplay}</div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setUnit('s')}
            className={`min-h-[44px] px-3 text-sm rounded ${unit === 's' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            秒
          </button>
          <button
            type="button"
            onClick={() => setUnit('ms')}
            className={`min-h-[44px] px-3 text-sm rounded ${unit === 'ms' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            毫秒
          </button>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('toTime')}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-sm ${mode === 'toTime' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          时间戳 → 时间
        </button>
        <button
          type="button"
          onClick={() => setMode('toTs')}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-sm ${mode === 'toTs' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          时间 → 时间戳
        </button>
      </div>

      {/* 输入区 */}
      {mode === 'toTime' ? (
        <div className="mb-3">
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            时间戳（{unit === 's' ? '秒' : '毫秒'}）
          </label>
          <input
            type="text"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="如 1700000000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[44px] dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      ) : (
        <div className="mb-3">
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            日期时间
          </label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[44px] dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      )}

      {/* 操作按钮区 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={mode === 'toTime' ? handleConvertTs : handleConvertDate}
          className="min-h-[44px] rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
        >
          转换
        </button>
        <ExampleButton onClick={fillExample} />
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          重置
        </button>
        {resultText && <CopyButton text={resultText} label="复制结果" />}
      </div>

      {/* 输出区 */}
      {resultText && (
        <pre className="mb-3 whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-sm dark:bg-gray-800">
          {resultText}
        </pre>
      )}

      {/* 错误区 */}
      <ErrorText message={error} />
      {toast && (
        <div className="mt-3 rounded-md bg-yellow-100 p-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          {toast}
        </div>
      )}

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
