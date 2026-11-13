import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { encodeBase64, decodeBase64 } from '../../tools/base64/utils'

const HISTORY_KEY = 'toolbox.history.base64'
const URL_LIMIT = 2000

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function Base64Page() {
  useSeo('Base64 编解码 - Toolbox', 'UTF-8 安全的 Base64 编解码，可选 URL-safe 模式。')
  const [searchParams, setSearchParams] = useSearchParams()

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [urlSafe, setUrlSafe] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readHistory<HistoryEntry>(HISTORY_KEY),
  )

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  // 读 URL 参数（仅首次挂载）
  useEffect(() => {
    const q = searchParams.get('q')
    const m = searchParams.get('m')
    const us = searchParams.get('us') === '1'
    if (q) {
      setInput(q)
      if (m === 'decode') setMode('decode')
      setUrlSafe(us)
      // 立即执行
      runConversion(q, m === 'decode' ? 'decode' : 'encode', us)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runConversion = (text: string, m: 'encode' | 'decode', safe: boolean): void => {
    setError(null)
    if (m === 'encode') {
      setOutput(encodeBase64(text, safe))
    } else {
      const r = decodeBase64(text, safe)
      if (typeof r === 'object') {
        setError(r.error)
        setOutput('')
        return
      }
      setOutput(r)
    }
  }

  const handleRun = () => {
    runConversion(input, mode, urlSafe)
    // 历史：记录输入（含模式与 URL-safe 状态，供 onPick 还原）
    const prefix = `B:${mode}:${urlSafe ? '1' : '0'}`
    const entries = [
      ...history,
      { id: makeId(), text: `${prefix}\n${input}`, time: Date.now() },
    ]
    writeHistory(HISTORY_KEY, entries, { max: 10 })
    setHistory(readHistory<HistoryEntry>(HISTORY_KEY))

    // URL 参数：输入 ≤2000 字符时同步
    if (input.length <= URL_LIMIT) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('q', input)
          next.set('m', mode)
          if (urlSafe) next.set('us', '1')
          else next.delete('us')
          return next
        },
        { replace: true },
      )
    }
  }

  const fillExample = () => {
    const example = '你好，世界'
    setInput(example)
    runConversion(example, mode, urlSafe)
  }

  const reset = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  // 历史条目形如：B:<m>:<us>\n<input>
  const parseEntry = (text: string): { m: 'encode' | 'decode'; us: boolean; input: string } => {
    const lines = text.split('\n')
    if (lines[0]?.startsWith('B:')) {
      const meta = lines[0].slice(2).split(':')
      const m = meta[0] === 'decode' ? 'decode' : 'encode'
      const us = meta[1] === '1'
      return { m, us, input: lines.slice(1).join('\n') }
    }
    return { m: 'encode', us: false, input: text }
  }

  const handlePick = (entry: { id: string; text: string; time: number }) => {
    const { m, us, input: picked } = parseEntry(entry.text)
    setMode(m)
    setUrlSafe(us)
    setInput(picked)
    runConversion(picked, m, us)
  }

  return (
    <ToolLayout title="Base64 编解码" description="UTF-8 安全的 Base64 编解码，可选 URL-safe 模式">
      {/* 模式切换 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('encode')}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-sm ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          编码
        </button>
        <button
          type="button"
          onClick={() => setMode('decode')}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-sm ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
        >
          解码
        </button>
      </div>

      {/* 输入区 */}
      <div className="mb-3">
        <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
          {mode === 'encode' ? '文本' : 'Base64'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm min-h-[44px] dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      {/* URL-safe 开关 */}
      <label className="mb-3 flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
        URL-safe 模式（-/_ 替代 +/-，去 padding）
      </label>

      {/* 操作按钮区 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleRun} className="min-h-[44px] rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700">
          {mode === 'encode' ? '编码' : '解码'}
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
        <div className="mb-3 rounded-md bg-gray-50 p-3 font-mono text-sm break-all dark:bg-gray-800">{output}</div>
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
