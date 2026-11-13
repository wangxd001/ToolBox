import { useEffect, useState } from 'react'

const THEME_KEY = 'toolbox.pref.theme'

type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function currentTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark') return t
  } catch {
    /* localStorage 不可用时跟随系统 */
  }
  return systemTheme()
}

export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* 写入失败不阻塞切换 */
    }
  }

  return [theme, setTheme]
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
      aria-label={theme === 'dark' ? '切换到亮色' : '切换到暗色'}
      title={theme === 'dark' ? '切换到亮色' : '切换到暗色'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
