import { useState } from 'react'
import type { HistoryEntry } from '../lib/history'

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
    <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[44px] px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {cleared ? '已清空' : '清空历史'}
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">暂无历史</p>
      ) : (
        <ul className="space-y-1">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onPick(e)}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {e.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
