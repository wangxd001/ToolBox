import { Link } from 'react-router-dom'
import { useSeo } from '../lib/useSeo'

const TOOLS = [
  { to: '/tools/timestamp', name: '时间戳转换', desc: 'Unix 时间戳与日期时间互转，本地时区 / UTC' },
  { to: '/tools/uuid', name: 'UUID 生成', desc: '批量生成 UUID v4，支持大小写与格式选项' },
  { to: '/tools/json', name: 'JSON 工具', desc: '格式化、压缩、校验、按键名排序' },
  { to: '/tools/base64', name: 'Base64 编解码', desc: 'UTF-8 安全编解码，可选 URL-safe 模式' },
  { to: '/tools/url', name: 'URL 编解码', desc: 'encodeURIComponent / decodeURIComponent 及 URI 变体' },
]

export function HomePage() {
  useSeo('Toolbox - 个人 Web 工具箱', '纯前端开发者工具箱：时间戳、UUID、JSON、Base64、URL 工具，数据不出浏览器。')

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">工具集</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <h2 className="mb-1 font-semibold">{t.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
