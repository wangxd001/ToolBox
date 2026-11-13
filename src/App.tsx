import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { TimestampPage } from './pages/tools/TimestampPage'
import { UuidPage } from './pages/tools/UuidPage'
import { JsonPage } from './pages/tools/JsonPage'
import { Base64Page } from './pages/tools/Base64Page'
import { UrlPage } from './pages/tools/UrlPage'

/** 开启 v7 迁移未来标志，消除控制台 Future Flag 告警（v7 默认行为） */
const ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

export default function App() {
  return (
    <BrowserRouter future={ROUTER_FUTURE}>
      <div className="flex min-h-dvh flex-col">
        <NavBar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools/timestamp" element={<TimestampPage />} />
            <Route path="/tools/uuid" element={<UuidPage />} />
            <Route path="/tools/json" element={<JsonPage />} />
            <Route path="/tools/base64" element={<Base64Page />} />
            <Route path="/tools/url" element={<UrlPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200/70 py-6 dark:border-slate-800/70">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 text-xs text-slate-400 dark:text-slate-500">
            <p>纯前端工具，数据不出浏览器</p>
            <p>Toolbox</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
