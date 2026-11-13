import { ReactNode } from 'react'

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
