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
      <h1 className="mb-1 text-xl font-bold">{title}</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div>{children}</div>
    </div>
  )
}
