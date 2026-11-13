import { ThemeToggle } from '../lib/theme'

export function NavBar() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
      <a href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Toolbox
      </a>
      <ThemeToggle />
    </header>
  )
}
