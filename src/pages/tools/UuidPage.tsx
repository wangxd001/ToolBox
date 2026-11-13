import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText } from '../../components/ErrorText'
import { ExampleButton } from '../../components/ExampleButton'
import { HistoryPanel } from '../../components/HistoryPanel'
import { Card, Btn, Label, TextInput, CheckBox } from '../../components/ui'
import { HashIcon } from '../../components/Icons'
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
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>数量（1~100）</Label>
              <TextInput
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full sm:w-36 font-mono"
              />
            </div>
            <div className="flex flex-col justify-end gap-0.5 pb-1">
              <CheckBox checked={upper} onChange={setUpper}>大写</CheckBox>
              <CheckBox checked={noHyphen} onChange={setNoHyphen}>去横线</CheckBox>
              <CheckBox checked={curly} onChange={setCurly}>加花括号</CheckBox>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="primary" onClick={handleGenerate}>
              <HashIcon size={16} />
              生成
            </Btn>
            <ExampleButton onClick={fillExample} />
            <Btn variant="ghost" onClick={reset}>重置</Btn>
            {results.length > 0 && (
              <CopyButton text={results.join('\n')} label="复制全部" />
            )}
          </div>
        </div>
      </Card>

      {/* 输出区 */}
      {results.length > 0 && (
        <Card
          title={`结果（${results.length} 条）`}
          action={<CopyButton text={results.join('\n')} label="复制全部" iconOnly />}
          bodyClassName="px-0 py-0"
        >
          <ul className="max-h-80 overflow-auto">
            {results.map((uuid, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0 dark:border-slate-800/70"
              >
                <span className="min-w-0 break-all font-mono text-sm text-slate-700 dark:text-slate-300">
                  {uuid}
                </span>
                <CopyButton text={uuid} label="复制" iconOnly className="h-9 w-9" />
              </li>
            ))}
          </ul>
        </Card>
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
