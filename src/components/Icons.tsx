/** 内联 SVG 图标（stroke 风格统一 1.8px），避免引入图标库依赖 */
import type { ReactNode } from 'react'

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ClockIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  )
}

export function HashIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M4 9h16M4 15h16M10 4 8 20M16 4l-2 16" />
    </Svg>
  )
}

export function BracesIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M8 4c-2 0-3 1-3 3v2c0 1.5-1 3-3 3 2 0 3 1.5 3 3v2c0 2 1 3 3 3" />
      <path d="M16 4c2 0 3 1 3 3v2c0 1.5 1 3 3 3-2 0-3 1.5-3 3v2c0 2-1 3-3 3" />
    </Svg>
  )
}

export function Base64Icon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="m9 18-6-6 6-6" />
      <path d="m15 6 6 6-6 6" />
    </Svg>
  )
}

export function LinkIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.6l3-3a5 5 0 0 0-7-7l-1.6 1.6" />
      <path d="M14 11a5 5 0 0 0-7.5-.6l-3 3a5 5 0 0 0 7 7l1.6-1.6" />
    </Svg>
  )
}

export function CopyIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  )
}

export function CheckIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="m5 12 5 5 9-9" />
    </Svg>
  )
}

export function SunIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function MoonIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </Svg>
  )
}

export function SearchIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

export function BoltIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </Svg>
  )
}

export function TrashIcon(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M10 4h4m-6 3 1 13h8l1-13" />
    </Svg>
  )
}
