import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { TimestampPage } from './pages/tools/TimestampPage'
import { UuidPage } from './pages/tools/UuidPage'
import { JsonPage } from './pages/tools/JsonPage'
import { Base64Page } from './pages/tools/Base64Page'
import { UrlPage } from './pages/tools/UrlPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <NavBar />
        <main className="mx-auto max-w-4xl px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools/timestamp" element={<TimestampPage />} />
            <Route path="/tools/uuid" element={<UuidPage />} />
            <Route path="/tools/json" element={<JsonPage />} />
            <Route path="/tools/base64" element={<Base64Page />} />
            <Route path="/tools/url" element={<UrlPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
