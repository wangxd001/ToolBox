import { useRef, useState } from 'react'

export function CopyButton({
  text,
  label = '复制',
}: {
  text: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timerRef = useRef<number | null>(null)

  const showFeedback = (ok: boolean) => {
    if (ok) {
      setCopied(true)
      setFailed(false)
    } else {
      setFailed(true)
      setCopied(false)
    }
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 1500)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      showFeedback(true)
    } catch {
      // 降级：隐藏 textarea + execCommand
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      showFeedback(ok)
    }
  }

  const display = copied ? '已复制' : failed ? '复制失败' : label

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex min-h-[44px] items-center justify-center rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
    >
      {display}
    </button>
  )
}
