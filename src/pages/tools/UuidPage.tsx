import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText } from '../../components/ErrorText'
import { HistoryPanel } from '../../components/HistoryPanel'
import { useSeo } from '../../lib/useSeo'
import {
  readHistory,
  writeHistory,
  clearHistory,
  HistoryEntry,
} from '../../lib/history'
import { formatUuid, clampCount, randomUuid, FormatOpts } from '../../tools/uuid/utils'

const HISTORY_KEY = 'toolbox.history.uuid'

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function UuidPage() {
  useSeo('UUID 生成 - Toolbox', '批量生成 UUID v4，支持大小写与格式选项。')

  const [count, setCount] = useState(5)
  const [upper, setUpper] = useState(false)
  const [noHyphen, setNoHyphen] = useState(false)
  const [curly, setCurly] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readHistory<HistoryEntry>(HISTORY_KEY),
  )

  const opts: FormatOpts = { upper, noHyphen, curly }

  const handleGenerate = () => {
    const n = clampCount(count)
    const list = Array.from({ length: n }, () => formatUuid(randomUuid(), opts))
    setResults(list)
    setError(null)
    // 记录整批
    const entries = [
      ...history,
      { id: makeId(), text: list.join('\n'), time: Date.now() },
    ]
    writeHistory(HISTORY_KEY, entries, { max: 10 })
    setHistory(readHistory<HistoryEntry>(HISTORY_KEY))
  }

  const fillExample = () => {
    setCount(1)
    setUpper(false)
    setNoHyphen(false)
    setCurly(false)
    setResults([])
    setError(null)
  }

  const reset = () => {
    setCount(1)
    setUpper(false)
    setNoHyphen(false)
    setCurly(false)
    setResults([])
    setError(null)
  }

  const handleClear = () => {
    clearHistory(HISTORY_KEY)
    setHistory([])
  }

  const handlePick = (entry: HistoryEntry) => {
    setResults(entry.text.split('\n').filter(Boolean))
    setError(null)
  }

  return (
    <ToolLayout title="UUID 生成" description="批量生成 UUID v4，支持大小写与格式选项">
      {/* 输入区 */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
          数量（1~100）
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 min-h-[44px] dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      {/* 选项 */}
      <div className="mb-4 flex flex-wrap gap-4">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.target.checked)}
          />
          大写
        </label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noHyphen}
            onChange={(e) => setNoHyphen(e.target.checked)}
          />
          去横线
        </label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={curly}
            onChange={(e) => setCurly(e.target.checked)}
          />
          加花括号
        </label>
      </div>

      {/* 操作按钮区 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="min-h-[44px] rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
        >
          生成
        </button>
        <button
          type="button"
          onClick={fillExample}
          className="min-h-[44px] rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          填入示例
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          重置
        </button>
        {results.length > 0 && (
          <CopyButton text={results.join('\n')} label="复制全部" />
        )}
      </div>

      {/* 输出区 */}
      {results.length > 0 && (
        <div className="mb-3 space-y-1 rounded-md bg-gray-50 p-3 font-mono text-sm dark:bg-gray-800">
          {results.map((uuid, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="break-all">{uuid}</span>
              <CopyButton text={uuid} label="复制" />
            </div>
          ))}
        </div>
      )}

      {/* 错误区 */}
      <ErrorText message={error} />

      {/* 历史 */}
      <HistoryPanel
        entries={history}
        onClear={handleClear}
        onPick={handlePick}
      />
    </ToolLayout>
  )
}
