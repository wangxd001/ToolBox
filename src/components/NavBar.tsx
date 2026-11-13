import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../lib/theme'
import {
  ChevronDownIcon,
  MenuIcon,
  ClockIcon,
  HashIcon,
  BracesIcon,
  Base64Icon,
  LinkIcon,
} from './Icons'

const NAV_TOOLS = [
  { to: '/tools/timestamp', name: '时间戳', Icon: ClockIcon },
  { to: '/tools/uuid', name: 'UUID', Icon: HashIcon },
  { to: '/tools/json', name: 'JSON', Icon: BracesIcon },
  { to: '/tools/base64', name: 'Base64', Icon: Base64Icon },
  { to: '/tools/url', name: 'URL', Icon: LinkIcon },
]

export function NavBar() {
  const location = useLocation()
  const activeTool = NAV_TOOLS.find((t) => location.pathname.startsWith(t.to))
  // 移动端工具列表默认折叠，选择工具后回到折叠态
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-lg text-base font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <img src="/favicon.svg" alt="" width="28" height="28" className="rounded-md" />
              <span className="hidden sm:inline">Toolbox</span>
            </a>
            {/* 桌面端：常驻工具链接 */}
            <nav aria-label="工具导航" className="hidden items-center gap-1 md:flex">
              {NAV_TOOLS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end
                  className={({ isActive }) =>
                    `flex min-h-[40px] cursor-pointer items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive || activeTool?.to === t.to
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <t.Icon size={16} />
                  {t.name}
                </NavLink>
              ))}
            </nav>
            {/* 移动端：折叠开关 */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-tool-nav"
              aria-label={open ? '收起工具列表' : '展开工具列表'}
              className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {open ? <ChevronDownIcon /> : <MenuIcon />}
            </button>
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
        {/* 移动端折叠面板：展开时显示，选中工具后自动收起 */}
        {open && (
          <nav
            id="mobile-tool-nav"
            aria-label="工具导航（移动端）"
            className="grid grid-cols-2 gap-1.5 pb-3 md:hidden"
          >
            {NAV_TOOLS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive || activeTool?.to === t.to
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <t.Icon size={16} />
                {t.name}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
