import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText, Toast } from '../../components/ErrorText'
import { ExampleButton } from '../../components/ExampleButton'
import { HistoryPanel } from '../../components/HistoryPanel'
import { Card, Btn, TextArea, Segmented, Badge } from '../../components/ui'
import { BracesIcon } from '../../components/Icons'
import { useSeo } from '../../lib/useSeo'
import {
  readHistory,
  writeHistory,
  clearHistory,
  HistoryEntry,
} from '../../lib/history'
import {
  formatJson,
  minifyJson,
  validateJson,
  sortKeysDeep,
} from '../../tools/json/utils'

const HISTORY_KEY = 'toolbox.history.json'
const EXAMPLE = '{\n  "name": "toolbox",\n  "version": 1,\n  "tags": ["json", "format"]\n}'

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function JsonPage() {
  useSeo('JSON 工具 - Toolbox', 'JSON 格式化、压缩、校验与按键名排序。')

  const [input, setInput] = useState(EXAMPLE)
  const [indent, setIndent] = useState<2 | 4>(2)
  const [output, setOutput] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readHistory<HistoryEntry>(HISTORY_KEY),
  )

  const pushToHistory = (text: string): void => {
    const entries = [
      ...history,
      { id: makeId(), text, time: Date.now() },
    ]
    const result = writeHistory(HISTORY_KEY, entries, {
      max: 5,
      maxItemBytes: 100 * 1024,
    })
    if (result.skipped) {
      setToast('超出历史上限')
      window.setTimeout(() => setToast(null), 2500)
    }
    setHistory(readHistory<HistoryEntry>(HISTORY_KEY))
  }

  const run = (action: 'format' | 'minify' | 'validate' | 'sort') => {
    setError(null)
    setValid(null)
    let out = ''
    if (action === 'format') {
      const r = formatJson(input, indent)
      if (typeof r === 'object') {
        setError(r.error)
        setOutput('')
        return
      }
      out = r
      setValid(true)
    } else if (action === 'minify') {
      const r = minifyJson(input)
      if (typeof r === 'object') {
        setError(r.error)
        setOutput('')
        return
      }
      out = r
      setValid(true)
    } else if (action === 'validate') {
      const r = validateJson(input)
      setValid(r.ok)
      if (r.ok) {
        out = '✓ 合法 JSON'
      } else {
        out = `✗ 非法 JSON（第 ${r.error.line} 行，第 ${r.error.column} 列）：${r.error.message}`
      }
    } else {
      // sort：先解析校验，再按键名排序后输出（带缩进）
      const r = formatJson(input, indent)
      if (typeof r === 'object') {
        setError(r.error)
        setOutput('')
        return
      }
      const sorted = sortKeysDeep(JSON.parse(input))
      out = JSON.stringify(sorted, null, indent)
      setValid(true)
    }
    setOutput(out)
    if (action === 'format' || action === 'minify' || action === 'sort') {
      pushToHistory(input)
    }
  }

  const fillExample = () => {
    setInput(EXAMPLE)
    setOutput('')
    setValid(null)
    setError(null)
  }

  const reset = () => {
    setInput(EXAMPLE)
    setOutput('')
    setValid(null)
    setError(null)
  }

  return (
    <ToolLayout title="JSON 工具" description="格式化、压缩、校验、按键名排序">
      {/* 输入区 */}
      <Card
        title="输入"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">缩进</span>
            <Segmented
              options={[
                { value: '2', label: '2 空格' },
                { value: '4', label: '4 空格' },
              ]}
              value={String(indent)}
              onChange={(v) => setIndent(v === '4' ? 4 : 2)}
              className="w-40"
            />
          </div>
        }
      >
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="输入 JSON"
        />
      </Card>

      {/* 操作按钮区 */}
      <Card bodyClassName="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="primary" onClick={() => run('format')}>
            <BracesIcon size={16} />
            格式化
          </Btn>
          <Btn variant="secondary" onClick={() => run('minify')}>压缩</Btn>
          <Btn variant="secondary" onClick={() => run('validate')}>校验</Btn>
          <Btn variant="secondary" onClick={() => run('sort')}>按键名排序</Btn>
          <ExampleButton onClick={fillExample} />
          <Btn variant="ghost" onClick={reset}>重置</Btn>
          {output && <CopyButton text={output} label="复制结果" />}
        </div>
      </Card>

      {/* 输出区 */}
      {output && (
        <Card
          title="结果"
          action={
            <div className="flex items-center gap-2">
              {valid !== null && (
                <Badge tone={valid ? 'success' : 'error'}>
                  {valid ? '合法' : '非法'}
                </Badge>
              )}
              <CopyButton text={output} label="复制" iconOnly />
            </div>
          }
          bodyClassName="px-0 py-0"
        >
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {output}
          </pre>
        </Card>
      )}

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
        onPick={(entry) => {
          setInput(entry.text)
          setOutput('')
          setValid(null)
          setError(null)
        }}
      />
    </ToolLayout>
  )
}
