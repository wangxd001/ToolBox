import { useEffect } from 'react'

/**
 * 每个路由挂载时设置 document.title 与 meta description（不做 SSR，PRD §5）。
 */
export function useSeo(title: string, description: string): void {
  useEffect(() => {
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])
}
