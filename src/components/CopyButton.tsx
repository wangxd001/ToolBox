import { useRef, useState } from 'react'
import { CopyIcon, CheckIcon } from './Icons'
import { Btn, BtnVariant } from './ui'

export function CopyButton({
  text,
  label = '复制',
  variant = 'secondary',
  iconOnly = false,
  className = '',
}: {
  text: string
  label?: string
  variant?: BtnVariant
  iconOnly?: boolean
  className?: string
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

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={copied || failed}
        aria-label={copied ? '已复制' : failed ? '复制失败' : label}
        className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${
          copied
            ? '!text-emerald-600 dark:!text-emerald-400'
            : failed
              ? '!text-red-500 dark:!text-red-400'
              : ''
        } ${className}`}
      >
        {copied ? <CheckIcon /> : failed ? <CopyIcon /> : <CopyIcon />}
      </button>
    )
  }

  return (
    <Btn
      variant={variant}
      className={className}
      onClick={handleCopy}
    >
      {copied ? <CheckIcon size={16} /> : null}
      {copied ? '已复制' : failed ? '复制失败' : label}
    </Btn>
  )
}
