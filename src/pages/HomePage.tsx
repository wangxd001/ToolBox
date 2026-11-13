import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeo } from '../lib/useSeo'
import {
  ClockIcon,
  HashIcon,
  BracesIcon,
  Base64Icon,
  LinkIcon,
  SearchIcon,
} from '../components/Icons'

const TOOLS = [
  {
    to: '/tools/timestamp',
    name: '时间戳转换',
    desc: 'Unix 时间戳与日期时间互转，本地时区 / UTC',
    keywords: ['时间戳', 'timestamp', 'unix', '日期', 'utc'],
    Icon: ClockIcon,
  },
  {
    to: '/tools/uuid',
    name: 'UUID 生成',
    desc: '批量生成 UUID v4，支持大小写与格式选项',
    keywords: ['uuid', 'v4', '标识符', 'id', '唯一'],
    Icon: HashIcon,
  },
  {
    to: '/tools/json',
    name: 'JSON 工具',
    desc: '格式化、压缩、校验、按键名排序',
    keywords: ['json', '格式化', '压缩', '校验', '排序', 'parse'],
    Icon: BracesIcon,
  },
  {
    to: '/tools/base64',
    name: 'Base64 编解码',
    desc: 'UTF-8 安全编解码，可选 URL-safe 模式',
    keywords: ['base64', '编码', '解码', 'url-safe'],
    Icon: Base64Icon,
  },
  {
    to: '/tools/url',
    name: 'URL 编解码',
    desc: 'encodeURIComponent / decodeURIComponent 及 URI 变体',
    keywords: ['url', 'encode', 'decode', 'uri', '百分号'],
    Icon: LinkIcon,
  },
] as const

export function HomePage() {
  useSeo('Toolbox - 个人 Web 工具箱', '纯前端开发者工具箱：时间戳、UUID、JSON、Base64、URL 工具，数据不出浏览器。')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return [...TOOLS]
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.desc.toLowerCase().includes(s) ||
        t.keywords.some((k) => k.toLowerCase().includes(s)),
    )
  }, [q])

  return (
    <div>
      {/* Hero */}
      <section className="py-8 sm:py-12">
        <div className="flex items-center gap-4">
          <img src="/favicon.svg" alt="" width="56" height="56" className="rounded-2xl shadow-sm" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              个人 Web 工具箱
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              时间戳 · UUID · JSON · Base64 · URL
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline dark:text-slate-500">
                纯前端运行，数据不出浏览器
              </span>
            </p>
          </div>
        </div>

        <div className="mt-7 relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工具，如 json、时间戳、uuid…"
            aria-label="搜索工具"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </section>

      {/* 工具网格 */}
      <section aria-label="工具列表" className="pb-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
            没有匹配「{q}」的工具
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/60"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-300 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
                  <t.Icon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900 dark:text-slate-100">
                    {t.name}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t.desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
