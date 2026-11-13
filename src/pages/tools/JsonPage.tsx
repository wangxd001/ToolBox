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
    let out = ''
    if (action === 'format') {
      const r = formatJson(input, indent)
      if (typeof r === 'object') {
        setError(r.error)
        return
      }
      out = r
    } else if (action === 'minify') {
      const r = minifyJson(input)
      if (typeof r === 'object') {
        setError(r.error)
        return
      }
      out = r
    } else if (action === 'validate') {
      const r = validateJson(input)
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
        return
      }
      const sorted = sortKeysDeep(JSON.parse(input))
      out = JSON.stringify(sorted, null, indent)
    }
    setOutput(out)
    if (action === 'format' || action === 'minify' || action === 'sort') {
      pushToHistory(input)
    }
  }

  const fillExample = () => {
    setInput(EXAMPLE)
    setOutput('')
    setError(null)
  }

  const reset = () => {
    setInput(EXAMPLE)
    setOutput('')
    setError(null)
  }

  return (
    <ToolLayout title="JSON 工具" description="格式化、压缩、校验、按键名排序">
      {/* 输入区 */}
      <div className="mb-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm min-h-[44px] dark:border-gray-600 dark:bg-gray-800"
          placeholder="输入 JSON"
        />
      </div>

      {/* 缩进选择 */}
      <div className="mb-3 flex items-center gap-3 text-sm">
        <span className="text-gray-600 dark:text-gray-400">缩进</span>
        <button
          type="button"
          onClick={() => setIndent(2)}
          className={`min-h-[44px] px-3 rounded ${indent === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          2 空格
        </button>
        <button
          type="button"
          onClick={() => setIndent(4)}
          className={`min-h-[44px] px-3 rounded ${indent === 4 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          4 空格
        </button>
      </div>

      {/* 操作按钮区 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => run('format')} className="min-h-[44px] rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700">
          格式化
        </button>
        <button type="button" onClick={() => run('minify')} className="min-h-[44px] rounded-md border border-gray-300 px-4 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200">
          压缩
        </button>
        <button type="button" onClick={() => run('validate')} className="min-h-[44px] rounded-md border border-gray-300 px-4 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200">
          校验
        </button>
        <button type="button" onClick={() => run('sort')} className="min-h-[44px] rounded-md border border-gray-300 px-4 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200">
          按键名排序
        </button>
        <button type="button" onClick={fillExample} className="min-h-[44px] rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200">
          填入示例
        </button>
        <button type="button" onClick={reset} className="min-h-[44px] rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200">
          重置
        </button>
        {output && <CopyButton text={output} label="复制结果" />}
      </div>

      {/* 输出区 */}
      {output && (
        <pre className="mb-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-sm dark:bg-gray-800">
          {output}
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
        onPick={(entry) => setInput(entry.text)}
      />
    </ToolLayout>
  )
}
