import { NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../lib/theme'

const NAV_TOOLS = [
  { to: '/tools/timestamp', name: '时间戳' },
  { to: '/tools/uuid', name: 'UUID' },
  { to: '/tools/json', name: 'JSON' },
  { to: '/tools/base64', name: 'Base64' },
  { to: '/tools/url', name: 'URL' },
]

export function NavBar() {
  const location = useLocation()
  const activeTool = NAV_TOOLS.find((t) => location.pathname.startsWith(t.to))

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <img src="/favicon.svg" alt="" width="28" height="28" className="rounded-md" />
            Toolbox
          </a>
          <nav aria-label="工具导航" className="hidden items-center gap-1 md:flex">
            {NAV_TOOLS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex min-h-[40px] cursor-pointer items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive || (activeTool?.to === t.to)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`
                }
              >
                {t.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
