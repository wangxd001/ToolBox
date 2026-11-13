import { useState } from 'react'
import type { HistoryEntry } from '../lib/history'
import { Btn } from './ui'
import { TrashIcon, CheckIcon } from './Icons'

export function HistoryPanel({
  title = '历史记录',
  entries,
  onClear,
  onPick,
}: {
  title?: string
  entries: HistoryEntry[]
  onClear: () => void
  onPick: (entry: HistoryEntry) => void
}) {
  const [cleared, setCleared] = useState(false)

  const handleClear = () => {
    onClear()
    setCleared(true)
    window.setTimeout(() => setCleared(false), 1500)
  }

  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
          {entries.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
              {entries.length}
            </span>
          )}
        </h2>
        <Btn
          variant="ghost"
          onClick={handleClear}
          className="min-h-[40px] px-3 text-xs"
          disabled={entries.length === 0}
        >
          {cleared ? <CheckIcon size={14} /> : <TrashIcon size={14} />}
          {cleared ? '已清空' : '清空'}
        </Btn>
      </header>
      {entries.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          暂无历史
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onPick(e)}
                className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-slate-800/60 dark:focus-visible:bg-slate-800/60"
              >
                <span className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
                  {e.text}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(e.time).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
