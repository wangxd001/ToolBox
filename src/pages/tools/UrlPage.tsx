import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolLayout } from '../../components/ToolLayout'
import { CopyButton } from '../../components/CopyButton'
import { ErrorText, Toast } from '../../components/ErrorText'
import { ExampleButton } from '../../components/ExampleButton'
import { HistoryPanel } from '../../components/HistoryPanel'
import { Card, Btn, Label, TextArea, Segmented, CheckBox } from '../../components/ui'
import { LinkIcon } from '../../components/Icons'
import { useSeo } from '../../lib/useSeo'
import {
  readHistory,
  writeHistory,
  clearHistory,
  HistoryEntry,
} from '../../lib/history'
import { encodeUrl, decodeUrl } from '../../tools/url/utils'

const HISTORY_KEY = 'toolbox.history.url'
const URL_LIMIT = 2000

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function UrlPage() {
  useSeo('URL 编解码 - Toolbox', 'URL 编解码，支持 encodeURIComponent 与 encodeURI。')
  const [searchParams, setSearchParams] = useSearchParams()

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [uriOnly, setUriOnly] = useState(false)
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
    const uri = searchParams.get('uri') === '1'
    if (q) {
      setInput(q)
      if (m === 'decode') setMode('decode')
      setUriOnly(uri)
      runConversion(q, m === 'decode' ? 'decode' : 'encode', m === 'decode' ? false : uri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runConversion = (text: string, m: 'encode' | 'decode', safe: boolean): void => {
    setError(null)
    if (m === 'encode') {
      setOutput(encodeUrl(text, safe))
    } else {
      const r = decodeUrl(text)
      if (typeof r === 'object') {
        setError(r.error)
        setOutput('')
        return
      }
      setOutput(r)
    }
  }

  const handleRun = () => {
    runConversion(input, mode, uriOnly)
    // 历史（含模式与 URI 开关，供 onPick 还原）
    const prefix = `U:${mode}:${uriOnly ? '1' : '0'}`
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
          if (uriOnly) next.set('uri', '1')
          else next.delete('uri')
          return next
        },
        { replace: true },
      )
    }
  }

  const fillExample = () => {
    const example = 'https://example.com/路径 a b'
    setInput(example)
    runConversion(example, mode, uriOnly)
  }

  const reset = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  // 历史条目形如：U:<m>:<uri>\n<input>
  const parseEntry = (text: string): { m: 'encode' | 'decode'; uri: boolean; input: string } => {
    const lines = text.split('\n')
    if (lines[0]?.startsWith('U:')) {
      const meta = lines[0].slice(2).split(':')
      const m = meta[0] === 'decode' ? 'decode' : 'encode'
      const uri = meta[1] === '1'
      return { m, uri, input: lines.slice(1).join('\n') }
    }
    return { m: 'encode', uri: false, input: text }
  }

  const handlePick = (entry: { id: string; text: string; time: number }) => {
    const { m, uri, input: picked } = parseEntry(entry.text)
    setMode(m)
    setUriOnly(uri)
    setInput(picked)
    runConversion(picked, m, m === 'encode' ? uri : false)
  }

  return (
    <ToolLayout title="URL 编解码" description="encodeURIComponent / decodeURIComponent 及 URI 变体">
      {/* 模式 + 输入 */}
      <Card
        title="输入"
        action={
          <Segmented
            options={[
              { value: 'encode', label: '编码' },
              { value: 'decode', label: '解码' },
            ]}
            value={mode}
            onChange={(v) => setMode(v as 'encode' | 'decode')}
            className="w-40"
          />
        }
      >
        <div className="space-y-4">
          <div>
            <Label>{mode === 'encode' ? '原始文本' : '编码文本'}</Label>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
            />
          </div>
          {mode === 'encode' && (
            <CheckBox checked={uriOnly} onChange={setUriOnly}>
              仅编码 URI（encodeURI，保留 :/?/& 等）
            </CheckBox>
          )}
        </div>
      </Card>

      {/* 操作按钮区 */}
      <Card bodyClassName="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="primary" onClick={handleRun}>
            <LinkIcon size={16} />
            {mode === 'encode' ? '编码' : '解码'}
          </Btn>
          <ExampleButton onClick={fillExample} />
          <Btn variant="ghost" onClick={reset}>重置</Btn>
          {output && <CopyButton text={output} label="复制结果" />}
        </div>
      </Card>

      {/* 输出区 */}
      {output && (
        <Card
          title="结果"
          action={<CopyButton text={output} label="复制" iconOnly />}
          bodyClassName="px-0 py-0"
        >
          <div className="overflow-wrap-anywhere p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {output}
          </div>
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
        onPick={handlePick}
      />
    </ToolLayout>
  )
}
